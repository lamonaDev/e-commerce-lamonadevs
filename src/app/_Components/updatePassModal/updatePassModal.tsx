"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

type ChangePasswordInputs = {
  currentPassword: string;
  password: string;
  rePassword: string;
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  password: z.string()
    .min(6, "New password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  rePassword: z.string(),
}).refine((data) => data.password === data.rePassword, {
  message: "Passwords don't match",
  path: ["rePassword"],
});

export default function ChangePasswordModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userToken } = useContext(MainContext) as {
    userToken: string | null;
  };

  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordInputs) => {
      if (!userToken) throw new Error("User not authenticated");

      const response = await axios.put(
        "https://ecommerce.routemisr.com/api/v1/users/changeMyPassword",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            token: userToken,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      reset();
      onOpenChange();
    },
    onError: (error: AxiosError) => {
      const message =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === 'object'
            ? (error.response.data as { message?: string }).message || "Failed to change password"
            : error.response.data
          : "Failed to change password";
      toast.error("Failed to update the password");
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordInputs> = (data) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <>
      <Button
        onPress={onOpen}
        variant="flat"
        className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full"
      >
        Change Password
      </Button>
      <Modal
        className="bg-emerald-50"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="center"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent className="mx-5">
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-3">
              <ModalHeader className="flex flex-col gap-1">Change Password</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6">
                  <Input
                    {...register("currentPassword")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Current Password"
                    isRequired
                    type={isCurrentVisible ? "text" : "password"}
                    isInvalid={!!errors.currentPassword}
                    errorMessage={errors.currentPassword?.message}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsCurrentVisible(!isCurrentVisible)}
                      >
                        {isCurrentVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    }
                  />
                  <Input
                    {...register("password")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="New Password"
                    isRequired
                    type={isNewVisible ? "text" : "password"}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsNewVisible(!isNewVisible)}
                      >
                        {isNewVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    }
                  />
                  <Input
                    {...register("rePassword")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Confirm New Password"
                    isRequired
                    type={isConfirmVisible ? "text" : "password"}
                    isInvalid={!!errors.rePassword}
                    errorMessage={errors.rePassword?.message}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                      >
                        {isConfirmVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    onClose();
                    reset();
                  }}
                  type="button"
                >
                  Close
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  type="submit"
                  isLoading={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}