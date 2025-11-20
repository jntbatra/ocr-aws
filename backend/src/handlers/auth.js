import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminInitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "../utils/response.js";
import config from "../config.js";

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

export const signup = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, password, username } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Use email as Cognito username since Cognito requires email as username
    const command = new SignUpCommand({
      ClientId: config.cognitoClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "preferred_username",
          Value: username || email,
        },
      ],
    });

    await cognitoClient.send(command);

    return successResponse({
      message:
        "User created successfully. Please check your email to confirm your account.",
      username: username || email,
      cognitoUsername: email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse(error.message || "Signup failed", 400);
  }
};

export const confirmSignup = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { username, email, confirmationCode } = body;

    if (!confirmationCode) {
      return errorResponse("Confirmation code is required", 400);
    }

    // Use email if provided, otherwise username (assume it's an email)
    const cognitoUsername = email || username;

    if (!cognitoUsername) {
      return errorResponse("Email or username is required", 400);
    }

    const command = new ConfirmSignUpCommand({
      ClientId: config.cognitoClientId,
      Username: cognitoUsername,
      ConfirmationCode: confirmationCode,
    });

    await cognitoClient.send(command);

    return successResponse({
      message: "Account confirmed successfully",
    });
  } catch (error) {
    console.error("Confirm signup error:", error);
    return errorResponse(error.message || "Confirmation failed", 400);
  }
};

export const login = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { username, email, password } = body;

    if (!password) {
      return errorResponse("Password is required", 400);
    }

    // Use email if provided, otherwise username (assume it's an email)
    const cognitoUsername = email || username;

    if (!cognitoUsername) {
      return errorResponse("Username or email is required", 400);
    }

    let response;

    try {
      // Try standard InitiateAuth first
      const command = new InitiateAuthCommand({
        ClientId: config.cognitoClientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: cognitoUsername,
          PASSWORD: password,
        },
      });
      response = await cognitoClient.send(command);
    } catch (err) {
      // If USER_PASSWORD_AUTH is not enabled, try AdminInitiateAuth
      if (
        err.__type === "InvalidParameterException" &&
        err.message.includes("flow not enabled")
      ) {
        console.log("USER_PASSWORD_AUTH not enabled, trying AdminInitiateAuth");
        const adminCommand = new AdminInitiateAuthCommand({
          UserPoolId: config.cognitoUserPoolId,
          ClientId: config.cognitoClientId,
          AuthFlow: "ADMIN_NO_SRP_AUTH",
          AuthParameters: {
            USERNAME: cognitoUsername,
            PASSWORD: password,
          },
        });
        response = await cognitoClient.send(adminCommand);
      } else {
        throw err;
      }
    }

    return successResponse({
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    });
  } catch (error) {
    console.error("Login error:", error);

    // Provide more specific error messages
    if (error.__type === "NotAuthorizedException") {
      return errorResponse("Invalid username or password", 401);
    } else if (error.__type === "UserNotConfirmedException") {
      return errorResponse(
        "User account not confirmed. Please check your email for confirmation code.",
        401
      );
    } else if (error.__type === "UserNotFoundException") {
      return errorResponse("User does not exist", 404);
    }

    return errorResponse(error.message || "Invalid credentials", 401);
  }
};

export const forgotPassword = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email } = body;

    if (!email) {
      return errorResponse("Email is required", 400);
    }

    const command = new ForgotPasswordCommand({
      ClientId: config.cognitoClientId,
      Username: email,
    });

    await cognitoClient.send(command);

    return successResponse({
      message:
        "Password reset code sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error.__type === "UserNotFoundException") {
      return errorResponse("User does not exist", 404);
    }

    return errorResponse(
      error.message || "Failed to initiate password reset",
      400
    );
  }
};

export const confirmForgotPassword = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, confirmationCode, newPassword } = body;

    if (!email || !confirmationCode || !newPassword) {
      return errorResponse(
        "Email, confirmation code, and new password are required",
        400
      );
    }

    const command = new ConfirmForgotPasswordCommand({
      ClientId: config.cognitoClientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return successResponse({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Confirm forgot password error:", error);

    if (error.__type === "InvalidPasswordException") {
      return errorResponse(
        "Password does not meet requirements. Please use a stronger password.",
        400
      );
    } else if (error.__type === "ExpiredCodeException") {
      return errorResponse(
        "Reset code has expired. Please request a new one.",
        400
      );
    } else if (error.__type === "CodeMismatchException") {
      return errorResponse("Invalid or incorrect confirmation code", 400);
    }

    return errorResponse(error.message || "Password reset failed", 400);
  }
};
