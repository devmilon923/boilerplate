import { Request, Response } from "express";
import httpStatus from "http-status";
import { handleAsync } from "../../utils/handleAsync";
import sendResponse from "../../utils/response";
import { TJwtUser } from "../../utils/jwtValidation";
import { prisma } from "../../utils/prisma";
import ServerError from "../../utils/error";
import z from "zod";
import { commentValidation, likeValidation } from "./post.validation";
import { FeedQueue } from "../../queue/producers/feed";
import { PostQueue } from "../../queue/producers/post";
import { NotificationQueue } from "../../queue/producers/notifications";

const createPost = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const result = await prisma.post.create({
    data: {
      ...req.body,
      author: { connect: { id: user.id } },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profession: true,
          isVerifyed: true,
        },
      },
    },
  });
  FeedQueue.prepareFeed(result.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Create post successfully!",
    data: result,
  });
});

const updatePost = handleAsync(async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Update post successfully!",
    data: true,
  });
});
const getPost = handleAsync(async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get post successfully!",
    data: true,
  });
});
const getPosts = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const pc = Number(req.query.pc as string);
  const limit = Number(req.query.limit as string) || 10;

  // Initial data for filtering
  const followerCount = await prisma.follower.count({
    where: { followerId: user.id },
  });

  const getMyFollowers = await prisma.follower.findMany({
    where: { followerId: user.id },
    skip:
      followerCount > 10 ? Math.floor(Math.random() * (followerCount - 10)) : 0,
    take: 10,
    select: { followingId: true },
  });

  const fIds = getMyFollowers.map((follower) => follower.followingId);

  // Simplified score calculation
  const score =
    followerCount < 2
      ? 0
      : followerCount < 10
        ? 2
        : followerCount < 50
          ? 10
          : followerCount < 100
            ? 20
            : 30;

  // Main posts query
  const result = await prisma.post.findMany({
    take: limit,
    skip: pc ? 1 : 0,
    cursor: pc ? { id: pc } : undefined,
    where: {
      authorId: { not: user.id },
      savedPosts: { none: { user: { id: user.id } } },
      OR: [{ authorId: { in: fIds } }, { trendScore: { gte: score } }],
    },
    select: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerifyed: true,
          profession: true,
        },
      },
      content: true,
      createdAt: true,
      id: true,
      likesCount: true,
      commentsCount: true,
      feeling: true,
    },
    orderBy: { id: "desc" },
  });

  if (result.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get all post successfully!",
      data: [],
      cursor: null,
    });
  }

  const postIds = result.map((data) => data.id);
  const authors = result.map((data) => data.author.id);

  // Parallel enrichment: likes, comments, and following status
  const [likes, latestComments, followers] = await Promise.all([
    prisma.likes.findMany({
      where: {
        userId: user.id,
        likeType: "post",
        sourceId: { in: postIds },
      },
      select: { sourceId: true },
    }),
    prisma.comment.findMany({
      where: {
        sourceId: { in: postIds },
        commentType: "post",
      },
      distinct: ["sourceId"],
      orderBy: [{ sourceId: "desc" }, { id: "desc" }],
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.follower.findMany({
      where: {
        followingId: { in: authors },
        followerId: user.id,
      },
      select: { followingId: true },
    }),
  ]);

  // Use Maps/Sets for O(1) lookup
  const likesSet = new Set(likes.map((like) => like.sourceId));
  const commentsMap = new Map(latestComments.map((c) => [c.sourceId, c]));
  const followingSet = new Set(followers.map((f) => f.followingId));

  const response = result.map((data) => ({
    ...data,
    isLiked: likesSet.has(data.id),
    isFollowing: followingSet.has(data.author.id),
    comments: commentsMap.has(data.id) ? [commentsMap.get(data.id)] : [],
  }));

  const cursor = result.length === limit ? result[result.length - 1].id : null;

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get all post successfully!",
    data: response,
    cursor: cursor,
  });
});
const getMyPosts = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const pc = Number(req.query.pc as string);
  const limit = Number(req.query.limit as string) || 10;

  // Main posts query
  const result = await prisma.post.findMany({
    take: limit,
    skip: pc ? 1 : 0,
    cursor: pc ? { id: pc } : undefined,
    where: {
      authorId: user.id,
      savedPosts: { none: { user: { id: user.id } } },
    },
    select: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerifyed: true,
          profession: true,
        },
      },
      content: true,
      createdAt: true,
      id: true,
      likesCount: true,
      commentsCount: true,
      feeling: true,
    },
    orderBy: [{ id: "desc" }, { trendScore: "desc" }],
  });

  if (result.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get all post successfully!",
      data: [],
      cursor: null,
    });
  }

  const postIds = result.map((data) => data.id);
  const authors = result.map((data) => data.author.id);

  // Parallel enrichment: likes, comments, and following status
  const [likes, latestComments, followers] = await Promise.all([
    prisma.likes.findMany({
      where: {
        userId: user.id,
        likeType: "post",
        sourceId: { in: postIds },
      },
      select: { sourceId: true },
    }),
    prisma.comment.findMany({
      where: {
        sourceId: { in: postIds },
        commentType: "post",
      },
      distinct: ["sourceId"],
      orderBy: [{ sourceId: "desc" }, { id: "desc" }],
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.follower.findMany({
      where: {
        followingId: { in: authors },
        followerId: user.id,
      },
      select: { followingId: true },
    }),
  ]);

  // Use Maps/Sets for O(1) lookup
  const likesSet = new Set(likes.map((like) => like.sourceId));
  const commentsMap = new Map(latestComments.map((c) => [c.sourceId, c]));
  const followingSet = new Set(followers.map((f) => f.followingId));

  const response = result.map((data) => ({
    ...data,
    isLiked: likesSet.has(data.id),
    isFollowing: followingSet.has(data.author.id),
    comments: commentsMap.has(data.id) ? [commentsMap.get(data.id)] : [],
  }));

  const cursor = result.length === limit ? result[result.length - 1].id : null;

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get all post successfully!",
    data: response,
    cursor: cursor,
  });
});
const deletePost = handleAsync(async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delete post successfully!",
    data: true,
  });
});

const addComment = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const { content, sourceId, commentType } = req.body as z.infer<
    typeof commentValidation
  >;
  const result = await prisma.comment.create({
    data: {
      content,
      sourceId,
      commentType,
      user: { connect: { id: user.id } },
    },
  });
  PostQueue.comment({ sourceId, isComment: true, commentType });
  NotificationQueue.comment({
    sourceId,
    commentType,
    sender: {
      name: user.name,
      id: user.id,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment added successfully!",
    data: result,
  });
  if (commentType === "post") {
    await prisma.post.update({
      where: {
        id: sourceId,
      },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });
  } else if (commentType === "replie") {
    await prisma.comment.update({
      where: {
        id: sourceId,
      },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });
  }
});
const getComments = handleAsync(async (req: Request, res: Response) => {
  const { sourceId, commentType } = req.query;
  const user = req.user as TJwtUser;
  const pc = Number(req.query.pc as string) || null;
  const limit = Number(req.query.limit as string) || 10;
  if (!sourceId) {
    throw new ServerError(httpStatus.BAD_REQUEST, "Source id is required");
  }
  if (!commentType) {
    throw new ServerError(httpStatus.BAD_REQUEST, "Comment type is required");
  }
  if (commentType !== "post" && commentType !== "replie") {
    throw new ServerError(
      httpStatus.BAD_REQUEST,
      "Comment type is not valid (post/replie)",
    );
  }
  const result = await prisma.comment.findMany({
    take: limit,
    skip: pc ? 1 : 0,
    cursor: pc ? { id: pc } : undefined,
    where: {
      sourceId: +sourceId,
      commentType,
    },
    orderBy: { id: "desc" },
    select: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      createdAt: true,
      content: true,
      id: true,
      likesCount: true,
      commentCount: true,
    },
  });
  const commentsIds = result.map((c) => c.id);
  const likes = await prisma.likes.findMany({
    where: {
      userId: user.id,
      likeType: "comment",
      sourceId: { in: commentsIds },
    },
    select: {
      sourceId: true,
    },
  });
  const uniqueLikeIds = new Set(likes.map((like) => like.sourceId));
  const response = result.map((c) => {
    return {
      ...c,
      isLiked: uniqueLikeIds.has(c.id),
    };
  });
  const cursor = result.length === limit ? result[result.length - 1].id : null;
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments get successfully!",
    data: response,
    cursor,
  });
});

export type TLikeState = {
  isLiked: boolean;
  postId: number | null;
};
export type TCommentState = {
  isComment: boolean;
  sourceId: number;
  commentType: "post" | "replie";
};
const likeAction = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const { sourceId, likeType } = req.body as z.infer<typeof likeValidation>;
  let likeState: TLikeState = {
    isLiked: false,
    postId: null,
  };
  try {
    await prisma.likes.create({
      data: {
        sourceId,
        likeType,
        user: { connect: { id: user.id } },
      },
    });
    console.log("handover to queue");
    NotificationQueue.like({
      sourceId,
      likeType,
      sender: {
        name: user.name,
        id: user.id,
      },
    });
    if (likeType === "post") {
      let post = await prisma.post.update({
        where: {
          id: sourceId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
      likeState.postId = sourceId;
    } else if (likeType === "replie") {
      let post = await prisma.comment.update({
        where: {
          id: sourceId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
    } else if (likeType === "comment") {
      await prisma.comment.update({
        where: {
          id: sourceId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
    }
    likeState.isLiked = true;
  } catch (error: any) {
    if (error.code === "P2002") {
      await prisma.likes.delete({
        where: {
          uniqueFinder: {
            sourceId,
            likeType,
            userId: user.id,
          },
        },
      });
      if (likeType === "post") {
        await prisma.post.update({
          where: {
            id: sourceId,
          },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        });
      } else if (likeType === "replie") {
        await prisma.comment.update({
          where: {
            id: sourceId,
          },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        });
      } else if (likeType === "comment") {
        await prisma.comment.update({
          where: {
            id: sourceId,
          },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        });
      }
    } else {
      throw error;
    }
  }
  if (likeState.postId !== null) PostQueue.like(likeState);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Like action successfully performed",
    data: likeState.isLiked,
  });
});

const bookmarkAction = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const { postId } = req.params;
  let status = true;
  let result = null;
  try {
    result = await prisma.savePost.create({
      data: {
        user: { connect: { id: +user.id } },
        post: { connect: { id: +postId } },
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      result = await prisma.savePost.delete({
        where: {
          uniqueBookmarkFinder: {
            userId: +user.id,
            postId: +postId,
          },
        },
      });
      status = false;
    } else {
      throw error;
    }
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookmark update successfully!",
    data: status,
  });
});
const bookmarksGet = handleAsync(async (req: Request, res: Response) => {
  const user = req.user as TJwtUser;
  const pc = Number(req.query.pc as string) || null;
  const limit = Number(req.query.limit as string) || 10;
  const result = await prisma.savePost.findMany({
    take: limit,
    skip: pc ? 1 : 0,
    cursor: pc ? { id: pc } : undefined,
    where: {
      userId: user.id,
    },
    orderBy: [{ id: "asc" }, { userId: "asc" }],
    select: {
      id: true,
      createdAt: true,
      post: {
        select: {
          id: true,
          likesCount: true,
          commentsCount: true,
          author: {
            select: {
              name: true,
              image: true,
              profession: true,
              isVerifyed: true,
            },
          },
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  const postIds = result.map((post) => post.post.id);
  const likes = await prisma.likes.findMany({
    where: {
      sourceId: { in: postIds },
      likeType: "post",
      userId: user.id,
    },
    select: {
      sourceId: true,
    },
  });
  const likeIds = new Set(likes.map((like) => like.sourceId));
  const cursor = result.length === limit ? result[result.length - 1].id : null;
  const response = result.map((post) => {
    return {
      ...post,
      isLiked: likeIds.has(post.post.id),
    };
  });
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookmarks get successfully!",
    data: response,
    cursor,
  });
});
export const PostController = {
  createPost,
  updatePost,
  getPost,
  deletePost,
  getPosts,
  addComment,
  getComments,
  likeAction,
  bookmarkAction,
  bookmarksGet,
  getMyPosts,
};
