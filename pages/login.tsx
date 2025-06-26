import Layout from "../layouts/DefaultLayout";
import Link from "next/link";
import { server } from "../utils/server";
import { postData } from "../utils/services";
import Button from "@/components/global/Button";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput } from "@mantine/core";
import { message } from "antd";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logUserIn } from "@/store/reducers/user";

type LoginMail = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const form = useForm({
    initialValues: { email: "", password: "" },

    // functions will be used to validate values at corresponding key
    validate: {
      password: (value) =>
        value.length < 6 ? "Password must have at least 6 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const [loading, setLoading] = useState(false);

  const loginUser = async (data: any) => {
    setLoading(true);

    try {
      const res = await postData(`/api/auth/login`, {
        email: data.email,
        password: data.password,
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
        if (errorMessage.toLowerCase().includes("password")) {
          errors.password = errorMessage;
        }
        form.setErrors(errors);
        return;
      }

      message.success(res?.message || "Login Successful");
      const userData = { ...res?.data?.user, token: res?.data?.token };
      dispatch(logUserIn(userData));
      if (router.query.next) {
        router.replace(router.query.next as string);
      } else {
        router.replace("/account");
      }
    } catch (error: any) {
      console.error("API error:", error);
      message.error(error?.message || "An error occurred. Please try again.");
      // setApiError("An error occurred. Please try again."); // Set a more descriptive error message if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className=" bg-gray-100 min-h-[70vh] py-20 flex items-center">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto  lg:py-0 flex-1">
          <h1 className="mb-10 font-bold text-3xl text-gray-700">
            Login to your account
          </h1>
          <div className="w-full  rounded-lg shadow border md:mt-0 sm:max-w-xl xl:p-0 bg-gray-50 border-gray-200">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <form onSubmit={form.onSubmit(loginUser)}>
                <TextInput
                  mt="sm"
                  size="md"
                  label="Email"
                  placeholder="johndoe@email.com"
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  mt="lg"
                  size="md"
                  label="Password"
                  placeholder="*****"
                  {...form.getInputProps("password")}
                />

                <Button
                  type="submit"
                  text="Login"
                  loading={loading}
                  className="mt-5"
                />

                <div className="mt-3">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline text-primary-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                <p className="text-sm font-light  text-gray-400 mt-5">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline text-primary-500"
                  >
                    Register here
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

export default LoginPage;
