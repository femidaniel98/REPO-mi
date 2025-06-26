import Layout from "../layouts/DefaultLayout";
import Link from "next/link";
import { postData } from "../utils/services";
import Button from "@/components/global/Button";
import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, PinInput } from "@mantine/core";
import { message } from "antd";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logUserIn } from "@/store/reducers/user";
import { FaBackward } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { formatTime } from "@/utils";
import { environment, getEnvironment } from "@/utils/server";

// ForgotPasswordPage component
const ForgotPasswordPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Email form instance
  const emailForm = useForm({
    initialValues: { email: "" },
    validate: {
      email: (value) =>
        value.trim() === ""
          ? "Email is required"
          : /^\S+@\S+$/.test(value)
          ? null
          : "Invalid email",
    },
  });

  // OTP form instance
  const otpForm = useForm({
    initialValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      code: (value) =>
        value.trim() === "" ? "Verification code is required" : null,
      password:
        getEnvironment() !== "production"
          ? (value) =>
              value.length < 6 ? "Password must have at least 6 letters" : null
          : (value) =>
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                value
              )
                ? null
                : "Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const [loading, setLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // Initial timer value in seconds
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [resendTimer]);

  const sendResetRequest = async (data: any) => {
    setLoading(true);

    try {
      const res = await postData(`/api/auth/reset-password`, {
        email: data.email,
      });

      if (!res?.success) {
        const errorMessage: string = res?.message || "";
        message.error(errorMessage || "An error occurred. Please try again.");
        const errors: any = {};
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user")
        ) {
          errors.email = errorMessage;
        }
        emailForm.setErrors(errors);
        return;
      }

      message.success(res?.message || "Password Reset Code Sent");

      otpForm.setValues({
        email: data.email,
        code: "",
        password: "",
        confirmPassword: "",
      });

      // Switch to the OTP form
      setIsOTPSent(true);
      setResendAttempts((prevAttempts) => prevAttempts + 1);
      setResendTimer(resendAttempts * 60);
    } catch (error: any) {
      console.error("API error:", error);
      message.error(error?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyResetPassword = async (data: any) => {
    setLoading(true);

    try {
      const res = await postData(`/api/auth/verify-reset-password`, {
        email: data.email,
        code: data.code,
        password: data.password,
      });

      if (!res?.success) {
        const errorMessage: string = res?.message || "";
        message.error(errorMessage || "An error occurred. Please try again.");
        const errors: any = {};
        if (errorMessage.toLowerCase().includes("code")) {
          errors.code = errorMessage;
        }
        if (errorMessage.toLowerCase().includes("password")) {
          errors.password = errorMessage;
        }
        otpForm.setErrors(errors);
        return;
      }

      // Display success message and redirect to the login page
      message.success(res?.message || "Password reset successful");
      router.push("/login");
    } catch (error: any) {
      console.error("API error:", error);
      message.error(error?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPassword = () => {
    // Allow resending only after the timer reaches 0
    if (resendTimer === 0) {
      setResendAttempts((prevAttempts) => prevAttempts + 1);
      console.log(resendAttempts);
      setResendTimer(resendAttempts * 60);
      sendResetRequest({ email: otpForm.values.email });
    }
  };

  const getResendTimerValue = (attempt: number) => {
    // Resend timer values based on attempts
    if (attempt === 1) {
      return 60; // 1 minute for the first attempt
    } else if (attempt === 2) {
      return 300; // 5 minutes for the second attempt
    } else {
      return 600; // 10 minutes for subsequent attempts
    }
  };

  const handleBackToEmailForm = () => {
    if (loading) return;

    setIsOTPSent(false);
    setResendTimer(60); // Reset timer when going back
    // emailForm.clear();
  };

  return (
    <Layout>
      <section className="bg-gray-100 min-h-[70vh] py-20 flex items-center">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
          <h1 className="mb-10 font-bold text-3xl text-gray-700">
            Forgot Password
          </h1>
          <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-xl xl:p-0 bg-gray-50 border-gray-200">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {isOTPSent && (
                <div className="mt-3">
                  <div
                    onClick={handleBackToEmailForm}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <MdArrowBack />
                    <span>Back</span>
                  </div>
                </div>
              )}
              {isOTPSent ? (
                // Form for OTP, Password, and Verify Password
                <form onSubmit={otpForm.onSubmit(verifyResetPassword)}>
                  <p className="font-medium">Enter OTP</p>
                  <PinInput
                    length={6}
                    size="md"
                    // label="Verification Code"
                    {...otpForm.getInputProps("code")}
                  />
                  <PasswordInput
                    mt="lg"
                    size="md"
                    label="New Password"
                    placeholder="*****"
                    {...otpForm.getInputProps("password")}
                  />
                  <PasswordInput
                    mt="lg"
                    size="md"
                    label="Confirm Password"
                    placeholder="*****"
                    {...otpForm.getInputProps("confirmPassword")}
                  />
                  <Button
                    type="submit"
                    text="Change Password"
                    loading={loading}
                    className="mt-5"
                  />
                  <div className="mt-3">
                    {resendTimer > 0 && !loading && (
                      <p className="text-sm text-gray-500">
                        Resend code in {formatTime(resendTimer)}
                      </p>
                    )}
                    {resendTimer === 0 && (
                      <Button
                        type="button"
                        text="Resend Code"
                        onClick={handleResendPassword}
                        className="text-sm bg-gray-400  text-gray-700 hover:bg-gray-500"
                        disabled={loading}
                      />
                    )}
                  </div>
                </form>
              ) : (
                // Form for Email
                <form onSubmit={emailForm.onSubmit(sendResetRequest)}>
                  <TextInput
                    mt="sm"
                    size="md"
                    label="Email"
                    placeholder="johndoe@email.com"
                    {...emailForm.getInputProps("email")}
                  />
                  <Button
                    type="submit"
                    text="Reset Password"
                    loading={loading}
                    className="mt-5"
                  />
                </form>
              )}

              <div className="mt-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:underline text-primary-500"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForgotPasswordPage;
