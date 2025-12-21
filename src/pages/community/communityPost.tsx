// src/pages/community/CommunityPost.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Heading,
  Box,
  Text,
  Spinner,
  useToast,
  Button,
  VStack,
  HStack,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FiDownload, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getPostBySlug, PostData } from "../../data/posts";
import axios from "axios";
import config from "../../resources/config/config";
import { Session } from "@supabase/supabase-js";
import { formatShortDate, formatLongDate, parseDate } from "../../utils/dateFormatter";

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
      // Note: PDF posts are now rendered with embedded viewer, no popup needed
    };

    loadPost();
  }, [slug, navigate, toast]);

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!post) return null;

  const PostComponent = post.Component;
  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };
  
  // Format the date based on its format (supports both YYYY-MM-DD and DD/M/YYYY)
  const getFormattedDate = () => {
    if (!post.publishedAt) return 'Date unavailable';
    
    // Use formatShortDate which internally uses parseDate to handle both API and standard formats
    return formatShortDate(post.publishedAt);
  };

  // If post has a PDF URL, render PDF viewer with mobile-friendly approach
  if (post.pdfUrl) {
    // Check if mobile device
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return (
      <Box bg="gray.50" minH="100vh" py={6} px={4}>
        <Container maxW="container.xl">
          {/* Back navigation */}
          <ChakraLink 
            as={Link} 
            to="/community" 
            display="inline-flex" 
            alignItems="center" 
            color="#2b8cee" 
            fontWeight="600"
            mb={4}
            _hover={{ textDecoration: 'none', opacity: 0.8 }}
          >
            <Icon as={FiArrowLeft} mr={2} />
            Back to Community
          </ChakraLink>

          {/* Post header */}
          <VStack align="stretch" spacing={4} mb={6}>
            <Text as="span" fontSize="sm" fontWeight="600" color="#2b8cee">
              {toTitleCase(post.category)}
            </Text>
            <Heading as="h1" fontWeight="700" fontSize={{ base: '22px', md: '28px' }} color="#0d141b">
              {post.title}
            </Heading>
            <Text fontSize="14px" color="#4A4A4A">
              {getFormattedDate()}
            </Text>
            
            {/* Primary action buttons - Large and prominent */}
            <VStack spacing={3} w="full" pt={2}>
              <Button
                as="a"
                href={post.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<FiExternalLink />}
                bg="#2b8cee"
                color="white"
                size="lg"
                w="full"
                h="56px"
                fontSize="16px"
                fontWeight="600"
                borderRadius="lg"
                _hover={{ bg: '#1a6bbd' }}
                _active={{ bg: '#1a6bbd' }}
              >
                Open PDF Document
              </Button>
              <Button
                as="a"
                href={post.pdfUrl}
                download
                leftIcon={<FiDownload />}
                variant="outline"
                borderColor="#2b8cee"
                color="#2b8cee"
                size="lg"
                w="full"
                h="56px"
                fontSize="16px"
                fontWeight="600"
                borderRadius="lg"
                _hover={{ bg: '#2b8cee', color: 'white' }}
              >
                Download PDF
              </Button>
            </VStack>
          </VStack>

          {/* Embedded PDF viewer - Only on desktop */}
          <Box 
            display={{ base: 'none', md: 'block' }}
            bg="white" 
            borderRadius="lg" 
            overflow="hidden" 
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box
              as="iframe"
              src={`${post.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              width="100%"
              height="80vh"
              border="none"
              title={post.title}
            />
          </Box>

          {/* Mobile message */}
          <Box 
            display={{ base: 'block', md: 'none' }}
            bg="white"
            p={6}
            borderRadius="lg"
            textAlign="center"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <Icon as={FiExternalLink} boxSize={12} color="#2b8cee" mb={4} />
            <Text fontSize="16px" fontWeight="600" color="#0d141b" mb={2}>
              PDF Document
            </Text>
            <Text fontSize="14px" color="#4A4A4A">
              Tap "Open PDF Document" above to view the full document in your browser.
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  // Regular post with component
  return (
    <Box bg="white" minH="100vh" py={12} px={4}>
      <Container maxW="container.md">
        {/* Back navigation */}
        <ChakraLink 
          as={Link} 
          to="/community" 
          display="inline-flex" 
          alignItems="center" 
          color="#0AADBC" 
          fontWeight="500"
          mb={6}
          _hover={{ textDecoration: 'none', opacity: 0.8 }}
        >
          <Icon as={FiArrowLeft} mr={2} />
          Back to Community
        </ChakraLink>

        <Text as={'h2'} fontSize={{base:'sm',md:'md'}} fontWeight={'600'} color={'#0AADBC'}>
          {toTitleCase(post.category)}
        </Text>
        <Text fontSize="sm" color="gray.900" mb={8}>
          {getFormattedDate()}
        </Text>
        <Box color="white" lineHeight="tall" fontSize="lg">
          <PostComponent />
        </Box>
      </Container>
    </Box>
  );
};

export default CommunityPost;
