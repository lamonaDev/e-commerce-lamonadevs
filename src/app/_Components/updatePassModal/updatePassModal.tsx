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
import { useContext } from "react";
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
      toast.error("faild to update the password");
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
                    type="password"
                    isInvalid={!!errors.currentPassword}
                    errorMessage={errors.currentPassword?.message}
                  />
                  <Input
                    {...register("password")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="New Password"
                    isRequired
                    type="password"
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                  />
                  <Input
                    {...register("rePassword")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Confirm New Password"
                    isRequired
                    type="password"
                    isInvalid={!!errors.rePassword}
                    errorMessage={errors.rePassword?.message}
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