import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
  VStack,
  HStack,
  Icon,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onAccountDeleted,
}: DeleteAccountModalProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeleteEnabled = confirmText === "DELETE";

  const handleDeleteAccount = async () => {
    if (!isDeleteEnabled || !config.supabaseClient) return;

    setIsDeleting(true);

    try {
      // Get the current session token
      const {
        data: { session },
      } = await config.supabaseClient.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      // Call the edge function to delete account
      const supabaseUrl = config.SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/delete-user-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Clear local storage
      localStorage.clear();

      toast({
        title: t("deleteAccount.successTitle"),
        description: t("deleteAccount.successMessage"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Notify parent component
      onAccountDeleted();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: t("deleteAccount.errorTitle"),
        description: error.message || t("deleteAccount.errorMessage"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent
        bg="white"
        borderRadius="16px"
        mx={4}
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      >
        <ModalHeader
          pt={6}
          pb={0}
          px={6}
          display="flex"
          alignItems="center"
          gap={3}
        >
          <Icon as={FiAlertTriangle} color="#DC2626" boxSize={6} />
          <Text fontSize="xl" fontWeight="600" color="#1F2937">
            {t("deleteAccount.title")}
          </Text>
        </ModalHeader>

        <ModalBody px={6} py={5}>
          <VStack spacing={4} align="stretch">
            {/* Warning message */}
            <Text fontSize="md" color="#4B5563" lineHeight="1.6">
              {t("deleteAccount.warningMessage")}
            </Text>

            {/* List of what will be deleted */}
            <VStack
              align="stretch"
              spacing={2}
              bg="#F9FAFB"
              p={4}
              borderRadius="12px"
              border="1px solid #E5E7EB"
            >
              <Text fontSize="sm" fontWeight="500" color="#374151">
                {t("deleteAccount.willDelete")}
              </Text>
              <Text fontSize="sm" color="#6B7280">
                • {t("deleteAccount.deleteItem1")}
              </Text>
              <Text fontSize="sm" color="#6B7280">
                • {t("deleteAccount.deleteItem2")}
              </Text>
              <Text fontSize="sm" color="#6B7280">
                • {t("deleteAccount.deleteItem3")}
              </Text>
              <Text fontSize="sm" color="#6B7280">
                • {t("deleteAccount.deleteItem4")}
              </Text>
            </VStack>

            {/* Confirmation input */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" fontWeight="500" color="#374151">
                {t("deleteAccount.confirmPrompt")}
              </Text>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE"
                size="lg"
                bg="white"
                border="2px solid #E5E7EB"
                borderRadius="12px"
                _focus={{
                  borderColor: confirmText === "DELETE" ? "#DC2626" : "#6B7280",
                  boxShadow: "none",
                }}
                _placeholder={{ color: "#9CA3AF" }}
                color="#1F2937"
                fontFamily="monospace"
                letterSpacing="2px"
              />
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter px={6} pb={6} pt={0}>
          <HStack spacing={3} w="full">
            {/* Cancel button - 30% grey */}
            <Button
              flex={1}
              onClick={handleClose}
              bg="white"
              color="#374151"
              border="1px solid #D1D5DB"
              borderRadius="12px"
              height="48px"
              fontSize="md"
              fontWeight="500"
              _hover={{ bg: "#F9FAFB" }}
              _active={{ bg: "#F3F4F6" }}
              isDisabled={isDeleting}
            >
              {t("deleteAccount.cancel")}
            </Button>

            {/* Delete button - 10% red accent */}
            <Button
              flex={1}
              onClick={handleDeleteAccount}
              bg="#DC2626"
              color="white"
              borderRadius="12px"
              height="48px"
              fontSize="md"
              fontWeight="500"
              leftIcon={
                isDeleting ? (
                  <Spinner size="sm" />
                ) : (
                  <Icon as={FiTrash2} boxSize={4} />
                )
              }
              _hover={{ bg: "#B91C1C" }}
              _active={{ bg: "#991B1B" }}
              _disabled={{
                bg: "#FCA5A5",
                cursor: "not-allowed",
              }}
              isDisabled={!isDeleteEnabled || isDeleting}
            >
              {isDeleting
                ? t("deleteAccount.deleting")
                : t("deleteAccount.confirmDelete")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteAccountModal;
