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
import { string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { MainContext } from "@/app/_Context/MainContext";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

export type AddressInputs = {
  name: string;
  details: string;
  phone: string;
  city: string;
};

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  details: z.string().min(5, "Details must be at least 5 characters").max(100, "Details must be at most 100 characters"),
  phone: z.string().regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City must be at most 50 characters"),
});

export default function AddressModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userToken, invalidateCart } = useContext(MainContext) as {
    userToken: string | null;
    invalidateCart: () => void;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressInputs>({
    resolver: zodResolver(addressSchema),
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressInputs) => {
      if (!userToken) throw new Error("User not authenticated");
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/addresses",
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
      toast.success("Address added successfully");
      invalidateCart();
      reset();
      onOpenChange();
    },
    onError: (error: AxiosError) => {
      const message =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === 'object'
            ? (error.response.data as { message?: string }).message || "Failed to add address"
            : error.response.data
          : "Failed to add address";
      toast.error("faild to add address");
    },
  });

  const onSubmit: SubmitHandler<AddressInputs> = (data) => {
    addAddressMutation.mutate(data);
  };

  return (
    <>
      <Button
        onPress={onOpen}
        color="success"
        variant="flat"
        className="mt-5 text-emerald-700"
      >
        Add Address
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
              <ModalHeader className="flex flex-col gap-1">Add Address</ModalHeader>
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
                    {...register("details")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="Details"
                    isRequired
                    type="text"
                    isInvalid={!!errors.details}
                    errorMessage={errors.details?.message}
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
                  <Input
                    {...register("city")}
                    className="shadow-2xl rounded-2xl"
                    color="success"
                    variant="flat"
                    label="City"
                    isRequired
                    type="text"
                    isInvalid={!!errors.city}
                    errorMessage={errors.city?.message}
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
                  isLoading={addAddressMutation.isPending}
                >
                  {addAddressMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}