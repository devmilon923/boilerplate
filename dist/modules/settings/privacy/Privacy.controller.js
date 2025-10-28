"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppInstruction = exports.htmlRoute = exports.updatePrivacy = exports.getAllPrivacy = exports.createPrivacy = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendError_1 = __importDefault(require("../../../utils/sendError"));
const Privacy_service_1 = require("./Privacy.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const user_utils_1 = require("../../user/user.utils");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const JwtToken_1 = require("../../../utils/JwtToken");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
exports.createPrivacy = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    const userId = decoded.id; // Assuming the token contains the userId
    // Find the user by userId
    const user = await (0, user_utils_1.findUserById)(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const { description } = req.body;
    const sanitizedContent = (0, sanitize_html_1.default)(description);
    if (!description) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Description is required!");
    }
    const result = await (0, Privacy_service_1.createPrivacyInDB)({ sanitizedContent });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Privacy created successfully.",
        data: result,
    });
});
exports.getAllPrivacy = (0, catchAsync_1.default)(async (req, res) => {
    const result = await (0, Privacy_service_1.getAllPrivacyFromDB)();
    const responseData = result[0];
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Privacy retrieved successfully.",
        data: responseData,
    });
});
exports.updatePrivacy = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    const userId = decoded.id;
    // Find the user by userId
    const user = await (0, user_utils_1.findUserById)(userId);
    if (!user) {
        // return sendError(res, {
        //   statusCode: httpStatus.NOT_FOUND,
        //   message: "User not found.",
        // });
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    // Sanitize the description field
    const { description } = req.body;
    if (!description) {
        // return sendError(res, {
        //   statusCode: httpStatus.BAD_REQUEST,
        //   message: "Description is required.",
        // });
    }
    const sanitizedDescription = (0, sanitize_html_1.default)(description);
    // Assume you're updating the terms based on the sanitized description
    const result = await (0, Privacy_service_1.updatePrivacyInDB)(sanitizedDescription);
    if (!result) {
        // return sendError(res, {
        //   statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        //   message: "Failed to update privacy.",
        // });
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update privacy.");
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Privacy updated successfully.",
        data: result,
    });
});
//------------->app publish ----------------------
exports.htmlRoute = (0, catchAsync_1.default)(async (req, res) => {
    try {
        // Fetch the privacy policy data from the database
        const result = await (0, Privacy_service_1.getAllPrivacyFromDB)();
        // Ensure that data exists and extract the first item
        const privacy = result && result.length > 0 ? result[0] : null;
        if (!privacy) {
            // If no privacy data is found, send a 404 response
            throw new ApiError_1.default(404, "Privacy policy not found.");
        }
        // Set the Content-Type header to text/html
        res.header("Content-Type", "text/html");
        // Send the HTML response with the privacy policy content
        res.send(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  color: #333;
              }
              .container {
                  max-width: 800px;
                  margin: 30px auto;
                  padding: 20px;
                  background: #fff;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #444;
              }
              footer {
                  text-align: center;
                  margin-top: 30px;
                  font-size: 0.9em;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
             
              ${privacy.description}
          </div>
         
      </body>
      </html>`);
    }
    catch (error) {
        console.error("Error fetching privacy policy:", error);
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Failed to fetch html route api.");
    }
});
exports.AppInstruction = (0, catchAsync_1.default)(async (req, res) => {
    try {
        // Set the Content-Type header to text/html
        res.header("Content-Type", "text/html");
        // Send the HTML response with the privacy policy content
        res.send(`

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instruction Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background-color: #f9f9f9;
            color: #333;
        }
        header {
            background: #4CAF50;
            color: white;
            padding: 10px 0;
            text-align: center;
        }
        section {
            margin: 20px 0;
        }
        h1, h2 {
            color: #4CAF50;
        }
        ol {
            padding-left: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        .step-image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border: 1px solid #ddd;
        }
        footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <header>
        <h1>Instruction Guide</h1>
    </header>

    <section style="margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center;">
        <h2>Step-by-Step Instructions</h2>
        <ol style="list-style-position: inside; padding: 0;">
            <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 2rem;">
                1. After logged in, first route to the Profile screen.
                <img src="https://showersshare.com/images/4.png" height="500" width="400" alt="Troubleshooting" class="step-image">

            </li>
            <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 2rem;">
                2. Tap on Settings.
                <img src="https://showersshare.com/images/1.png" height="500" width="400" alt="Gathering Materials" class="step-image">
            </li>
            <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 2rem;">
                3. Then tap on Delete.
                <img src="https://showersshare.com/images/2.png" height="500" width="400" alt="Following Steps" class="step-image">
            </li>
           
            <li style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; font-size: 2rem;">
                4. Press the Delete button.
                <img src="https://showersshare.com/images/3.png" height="500" width="400" alt="Reviewing Work" class="step-image">
            </li>
        </ol>
    </section>
    
    

    <footer>
        <p>&copy; 2025 Shower Share All rights reserved.</p>
    </footer>
</body>
</html>


    `);
    }
    catch (error) {
        console.error("Error fetching privacy policy:", error);
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Failed to fetch instruction api.");
    }
});
//# sourceMappingURL=Privacy.controller.js.map