// Import necessary modules and components
import Layout from "../layouts/DefaultLayout";
import Link from "next/link";
import { getEnvironment, server } from "../utils/server";
import { postData } from "../utils/services";
import Button from "@/components/global/Button";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput } from "@mantine/core";
import { message } from "antd";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { logUserIn } from "@/store/reducers/user";

// Define the registration form fields
type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
};

// RegistrationPage component
const RegistrationPage = () => {
  // Initialize necessary variables and hooks
  const router = useRouter();
  const dispatch = useDispatch();
  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    // Validation functions for form fields
    validate: {
      firstName: (value) =>
        value.trim() === "" ? "First Name is required" : null,
      lastName: (value) =>
        value.trim() === "" ? "Last Name is required" : null,
      email: (value) =>
        value.trim() === ""
          ? "Email is required"
          : /^\S+@\S+$/.test(value)
          ? null
          : "Invalid email",
      phoneNumber: (value) =>
        value.trim() === "" ? "Phone Number is required" : null,
      address: (value) => (value.trim() === "" ? "Address is required" : null),

      password:
        getEnvironment() === "local"
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

  // Function to handle registration
  const registerUser = async (data: RegistrationData) => {
    setLoading(true);

    try {
      // Send registration data to the server
      const res = await postData(`/api/auth/signup`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        password: data.password,
      });

      // Handle registration success
      if (!res?.success) {
        const errorMessage: string = res?.message || "";
        message.error(errorMessage || "An error occurred. Please try again.");
        const errors: any = {};
        // Handle specific error messages
        // Add more conditions if needed for other fields
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user")
        ) {
          errors.email = errorMessage;
        }
        if (errorMessage.toLowerCase().includes("password")) {
          errors.password = errorMessage;
        }
        form.setErrors(errors);
        return;
      }

      // Display success message and redirect to login page
      message.success(res?.message || "Registration Successful");
      const userData = { ...res?.data?.user, token: res?.data?.token };
      dispatch(logUserIn(userData));
      if (router.query.next) {
        router.replace(
          (router.query.next as string) === "/"
            ? ""
            : `/${router.query.next as string}`
        );
      } else {
        router.replace("/account");
      }
    } catch (error: any) {
      console.error("API error:", error);
      message.error(error?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Render the registration page layout
    <Layout title="Create an Account">
      <section className="bg-gray-100 min-h-[70vh] py-20 flex items-center">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
          <h1 className="mb-10 font-bold text-3xl text-gray-700">
            Create an Account
          </h1>
          <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-xl xl:p-0 bg-gray-50 border-gray-200">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form onSubmit={form.onSubmit(registerUser)}>
                {/* Input fields for registration form */}
                <div className="flex gap-x-4 md:gap-x-6">
                  <TextInput
                    mt="sm"
                    size="md"
                    label="First Name"
                    placeholder="John"
                    {...form.getInputProps("firstName")}
                  />
                  <TextInput
                    mt="sm"
                    size="md"
                    label="Last Name"
                    placeholder="Doe"
                    {...form.getInputProps("lastName")}
                  />
                </div>

                <TextInput
                  mt="sm"
                  size="md"
                  label="Email"
                  placeholder="johndoe@email.com"
                  {...form.getInputProps("email")}
                />
                <TextInput
                  mt="sm"
                  size="md"
                  label="Phone Number"
                  placeholder="123-456-7890"
                  {...form.getInputProps("phoneNumber")}
                />
                <TextInput
                  mt="sm"
                  size="md"
                  label="Address"
                  placeholder="123 Main St, City, Country"
                  {...form.getInputProps("address")}
                />
                <PasswordInput
                  mt="lg"
                  size="md"
                  label="Password"
                  placeholder="*****"
                  {...form.getInputProps("password")}
                />
                <PasswordInput
                  mt="lg"
                  size="md"
                  label="Confirm Password"
                  placeholder="*****"
                  {...form.getInputProps("confirmPassword")}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  text="Register"
                  loading={loading}
                  className="mt-5"
                />

                {/* Link to login page */}
                <p className="text-sm font-light text-gray-400 mt-5">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline text-primary-500"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

// Export the RegistrationPage component
export default RegistrationPage;
