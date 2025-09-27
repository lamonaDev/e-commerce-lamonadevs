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

type UserUpdateInputs = {
  name: string;
  email: string;
  phone: string;
};

const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
});

export default function UpdateUserModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userToken } = useContext(MainContext) as {
    userToken: string | null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserUpdateInputs>({
    resolver: zodResolver(userUpdateSchema),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserUpdateInputs) => {
      if (!userToken) throw new Error("User not authenticated");

      const response = await axios.put(
        "https://ecommerce.routemisr.com/api/v1/users/updateMe/",
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
      toast.success("Profile updated successfully");
      reset();
      onOpenChange();
    },
    onError: (error: AxiosError) => {
      const message =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === 'object'
            ? (error.response.data as { message?: string }).message || "Failed to update profile"
            : error.response.data
          : "Failed to update profile";
      toast.error("faild to update the user profile");
    },
  });

  const onSubmit: SubmitHandler<UserUpdateInputs> = (data) => {
    updateUserMutation.mutate(data);
  };

  return (
    <>
      <Button
        onPress={onOpen}
        variant="flat"
        className="bg-gray-700 hover:bg-gray-600 text-blue-200 hover:text-white py-3 w-full"
      >
        Update Profile
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
              <ModalHeader className="flex flex-col gap-1">Update Profile</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6">
                  <Input
                    {...register("name")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Name"
                    isRequired
                    type="text"
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                  <Input
                    {...register("email")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Email"
                    isRequired
                    type="email"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                  />
                  <Input
                    {...register("phone")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Phone"
                    isRequired
                    type="tel"
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
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
                  isLoading={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}