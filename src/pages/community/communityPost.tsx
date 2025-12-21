// src/pages/community/CommunityPost.tsx
// Full-screen immersive layout for all community posts
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Spinner,
  useToast,
  Button,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiDownload, FiExternalLink } from "react-icons/fi";
import { getPostBySlug, PostData } from "../../data/posts";
import axios from "axios";
import config from "../../resources/config/config";

const CommunityPost: React.FC = () => {
  // Extract the slug (using wildcard parameter for nested routes)
  const { "*": slug } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Use a ref to ensure that the same toast is not shown twice.
  const toastShownRef = useRef<{ [key: string]: boolean }>({});

  const showToastOnce = (id: string, options: any) => {
    if (!toastShownRef.current[id]) {
      toast(options);
      toastShownRef.current[id] = true;
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      // Retrieve the post using the slug.
      const foundPost = getPostBySlug(slug || "");
      if (!foundPost) {
        showToastOnce(`post-not-found-${slug}`, {
          title: "Post Not Found",
          description: `The post with slug "${slug}" was not found.`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        navigate("/community");
        return;
      }

      // If the post is confidential (accessLevel "NDA"), then check NDA access via API.
      if (foundPost.accessLevel === "NDA") {
        // Retrieve the current session.
        const { data: { session } } = await config.supabaseClient?.auth.getSession() || { data: { session: null } };
        if (!session) {
          showToastOnce("access-restricted-no-session", {
            title: "Access Restricted",
            description:
              "You must be logged in and complete the NDA process to view confidential posts.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
          navigate("/community");
          return;
        }
        try {
          const response = await axios.post(
            "https://gsqmwxqgqrgzhlhmbscg.supabase.co/rest/v1/rpc/check_access_status",
            {},
            {
              headers: {
                apikey: config.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const ndaStatus = response.data;
          console.log("NDA Access Status:", ndaStatus);
          if (ndaStatus !== "Approved") {
            showToastOnce("access-restricted-nda", {
              title: "Access Restricted",
              description:
                "You are not approved to view this confidential post. Please complete the NDA process.",
              status: "error",
              duration: 4000,
              isClosable: true,
            });
            navigate("/community");
            return;
          }
        } catch (error) {
          console.error("Error checking NDA status:", error);
          showToastOnce("access-error-nda", {
            title: "Error",
            description:
              "Error checking NDA access status. Please try again later.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
          navigate("/community");
          return;
        }
      }

      // If all checks pass, set the post and stop loading.
      setPost(foundPost);
      setLoading(false);
    };

    loadPost();
  }, [slug, navigate, toast]);

  if (loading) {
    return (
      <Box 
        position="fixed"
        top="64px"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="white"
        zIndex="999"
      >
        <Spinner size="xl" color="#2b8cee" thickness="3px" />
      </Box>
    );
  }

  if (!post) return null;

  const PostComponent = post.Component;

  // Floating back button component
  const FloatingBackButton = () => (
    <IconButton
      aria-label="Back to Community"
      icon={<Icon as={FiArrowLeft} boxSize={5} />}
      position="fixed"
      top={{ base: "76px", md: "80px" }}
      left={{ base: "12px", md: "20px" }}
      zIndex="1001"
      bg="rgba(255, 255, 255, 0.95)"
      color="#0d141b"
      borderRadius="full"
      boxShadow="0 2px 12px rgba(0,0,0,0.15)"
      size="md"
      onClick={() => navigate("/community")}
      _hover={{ 
        bg: "white", 
        transform: "scale(1.05)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
      }}
      _active={{ transform: "scale(0.95)" }}
      transition="all 0.2s ease"
    />
  );

  // If post has a PDF URL, render full-screen PDF viewer
  if (post.pdfUrl) {
    return (
      <>
        {/* Full-screen PDF container */}
        <Box 
          position="fixed"
          top="64px"
          left="0"
          right="0"
          bottom="0"
          width="100vw"
          height="calc(100vh - 64px)"
          overflow="hidden"
          zIndex="999"
          bg="white"
        >
          {/* Desktop: Embedded PDF viewer */}
          <Box
            display={{ base: 'none', md: 'block' }}
            width="100%"
            height="100%"
            position="relative"
          >
            {/* Desktop Back Button */}
            <IconButton
              aria-label="Back to Community"
              icon={<Icon as={FiArrowLeft} boxSize={5} />}
              position="absolute"
              top="16px"
              left="16px"
              zIndex="1001"
              bg="white"
              color="#0d141b"
              borderRadius="full"
              boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              size="md"
              onClick={() => navigate("/community")}
              _hover={{ bg: 'gray.50' }}
            />
            <Box
              as="iframe"
              src={`${post.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              width="100%"
              height="100%"
              border="none"
              title={post.title}
            />
          </Box>

          {/* Mobile: Clean left-aligned design matching HTML template */}
          <Box 
            display={{ base: 'flex', md: 'none' }}
            flexDirection="column"
            height="100%"
            bg="white"
          >
            {/* Top Navigation - Back Button */}
            <Box p={4} pb={2}>
              <IconButton
                aria-label="Back to Community"
                icon={<Icon as={FiArrowLeft} boxSize={6} />}
                size="lg"
                variant="ghost"
                color="#0d141b"
                borderRadius="full"
                onClick={() => navigate("/community")}
                _hover={{ bg: 'gray.100' }}
              />
            </Box>

            {/* Main Content */}
            <Box px={4} pt={4} flex="1">
              {/* PDF Icon */}
              <Box pb={6}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  h="64px"
                  w="64px"
                  borderRadius="2xl"
                  bg="rgba(43, 140, 238, 0.1)"
                >
                  <Icon as={FiExternalLink} boxSize={9} color="#2b8cee" />
                </Box>
              </Box>

              {/* Text Content */}
              <Box pb={8}>
                <Text 
                  fontSize="22px" 
                  fontWeight="700" 
                  color="#0d141b" 
                  lineHeight="1.3"
                  letterSpacing="-0.01em"
                  mb={3}
                >
                  {post.title}
                </Text>
                <Text 
                  fontSize="14px" 
                  fontWeight="400" 
                  color="#6b7280" 
                  lineHeight="1.5"
                >
                  Tap below to view the full PDF document in your browser.
                </Text>
              </Box>

              {/* Action Buttons */}
              <Box display="flex" flexDirection="column" gap={4}>
                {/* Primary CTA */}
                <Button
                  as="a"
                  href={post.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  bg="#2b8cee"
                  color="white"
                  w="full"
                  h="56px"
                  fontSize="16px"
                  fontWeight="700"
                  borderRadius="lg"
                  boxShadow="sm"
                  _hover={{ bg: '#2579d1' }}
                  _active={{ bg: '#2579d1' }}
                >
                  Open PDF Document
                </Button>

                {/* Secondary CTA */}
                <Button
                  as="a"
                  href={post.pdfUrl}
                  download
                  variant="outline"
                  borderWidth="2px"
                  borderColor="#2b8cee"
                  color="#2b8cee"
                  bg="transparent"
                  w="full"
                  h="56px"
                  fontSize="16px"
                  fontWeight="700"
                  borderRadius="lg"
                  _hover={{ bg: 'rgba(43, 140, 238, 0.05)' }}
                  _active={{ bg: 'rgba(43, 140, 238, 0.1)' }}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>

            {/* Bottom safe area */}
            <Box h={8} w="full" />
          </Box>
        </Box>
      </>
    );
  }

  // Regular post with React component - Full-screen immersive layout
  return (
    <>
      {/* Floating Back Button */}
      <FloatingBackButton />
      
      {/* Full-screen content container */}
      <Box 
        position="fixed"
        top="64px"
        left="0"
        right="0"
        bottom="0"
        width="100vw"
        height="calc(100vh - 64px)"
        overflow="auto"
        zIndex="999"
        bg="white"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a1a1a1',
          },
        }}
      >
        {/* Post content */}
        <Box 
          maxW="900px" 
          mx="auto" 
          px={{ base: 4, md: 8 }}
          py={{ base: 6, md: 10 }}
          pt={{ base: "60px", md: "40px" }} // Extra top padding for floating button
        >
          <PostComponent />
        </Box>
      </Box>
    </>
  );
};

export default CommunityPost;
