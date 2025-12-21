// Path: /pages/community/communityList.tsx
// Revamped Community Page - Clean minimal design with Header/Bottom Nav

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronRight, FiArrowLeft, FiSearch, FiMenu } from "react-icons/fi";
import NDARequestModal from "../../components/NDARequestModal";
import NDADocumentModal from "../../components/NDADocumentModal";
import config from "../../resources/config/config";
import { getPosts, PostData } from "../../data/posts";
import { formatShortDate, parseDate } from "../../utils/dateFormatter";

// Dropdown labels
const NDA_OPTION = "Sensitive Documents (NDA approval Req.)";
const MARKET_UPDATES_OPTION = "Market Updates";
const PINNED_SLUGS = [
  "general/ai-powered-berkshire-hathaway",
  "general/sell-the-wall-featured",
];

// Supabase REST API settings
const ALOHA_FUNDS_API_BASE =
  (import.meta as any).env?.VITE_MARKET_SUPABASE_URL ||
  "https://spmxyqxjqxcyywkapong.supabase.co";
const ALOHA_FUNDS_API_KEY =
  (import.meta as any).env?.VITE_MARKET_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbXh5cXhqcXhjeXl3a2Fwb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTYwNDIsImV4cCI6MjA2MDI5MjA0Mn0._C6lZcTubk2VuwDKC2uDOsiFFPaKRiEJSqBjtGpm99E";

interface UnifiedPost {
  id: string;
  title: string;
  date: string;
  slug?: string;
  isApiReport?: boolean;
  description?: string;
  category?: string;
}

const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.substr(1).toLowerCase());

const CommunityList: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const mountRef = useRef(true);

  // Local posts
  const localPosts = useMemo<PostData[]>(() => getPosts(), []);

  // API reports state
  const [apiReports, setApiReports] = useState<UnifiedPost[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [ndaApproved, setNdaApproved] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [showNdaDocModal, setShowNdaDocModal] = useState(false);
  const [ndaMetadata, setNdaMetadata] = useState<any>(null);
  const [ndaLoading, setNdaLoading] = useState(false);

  // Fetch API reports
  useEffect(() => {
    const fetchReports = async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const url = `${ALOHA_FUNDS_API_BASE}/rest/v1/reports?select=*`;
        const resp = await axios.get<UnifiedPost[]>(url, {
          headers: {
            apikey: ALOHA_FUNDS_API_KEY,
            Authorization: `Bearer ${ALOHA_FUNDS_API_KEY}`,
            "Content-Type": "application/json",
          },
        });
        setApiReports(
          resp.data
            .filter((r) => r.id && r.date)
            .map((r) => ({ ...r, isApiReport: true }))
        );
      } catch (err: any) {
        console.error(err);
        setApiError(err.message || "Failed to fetch reports");
      } finally {
        setApiLoading(false);
        mountRef.current = false;
      }
    };

    if (mountRef.current) fetchReports();
  }, []);

  // Build category lists
  const publicPosts = useMemo(
    () => localPosts.filter((p) => p.accessLevel === "Public"),
    [localPosts]
  );
  const ndaPosts = useMemo(
    () => localPosts.filter((p) => p.accessLevel === "NDA"),
    [localPosts]
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(publicPosts.map((p) => p.category)));
    return cats.filter(
      (c) => !["market", "market updates"].includes(c.trim().toLowerCase())
    );
  }, [publicPosts]);

  const dropdownOptions = useMemo(
    () => ["All", ...categories, MARKET_UPDATES_OPTION, NDA_OPTION],
    [categories]
  );

  // Get sample description
  const getPostDescription = (post: UnifiedPost) => {
    if (post.description) return post.description;
    
    if (post.title.toLowerCase().includes("ai") || post.title.toLowerCase().includes("artificial intelligence")) {
      return "Exploring how artificial intelligence is revolutionizing portfolio management and risk assessment in modern financial markets.";
    } else if (post.title.toLowerCase().includes("market")) {
      return "Our latest analysis of market trends and investment opportunities in the current economic climate.";
    } else if (post.title.toLowerCase().includes("review") || post.title.toLowerCase().includes("performance")) {
      return "Comprehensive review of performance metrics and strategic adjustments for optimal results.";
    } else {
      return "Stay informed with our latest market insights, research findings, and company updates.";
    }
  };

  // Combine and sort all posts
  const allContentSorted = useMemo<UnifiedPost[]>(() => {
    const localMarket = localPosts
      .filter(
        (p) =>
          p.accessLevel === "Public" &&
          (p.category.toLowerCase().includes("market") ||
            p.slug.toLowerCase().includes("market"))
      )
      .map((p) => ({
        id: p.slug,
        title: p.title,
        date: p.publishedAt,
        slug: p.slug,
        isApiReport: false,
        description: p.description || getPostDescription({id: p.slug, title: p.title, date: p.publishedAt}),
        category: p.category,
      }));

    const regs = publicPosts
      .filter(
        (p) =>
          !p.slug.toLowerCase().includes("market") &&
          !["market", "market updates"].includes(p.category.toLowerCase())
      )
      .map((p) => ({
        id: p.slug,
        title: p.title,
        date: p.publishedAt,
        slug: p.slug,
        isApiReport: false,
        description: p.description || getPostDescription({id: p.slug, title: p.title, date: p.publishedAt}),
        category: p.category,
      }));

    const merged = [...regs, ...localMarket, ...apiReports];
    return merged.sort((a, b) => {
      const da = parseDate(a.date)?.getTime() || 0;
      const db = parseDate(b.date)?.getTime() || 0;
      return db - da;
    });
  }, [publicPosts, localPosts, apiReports]);

  // Apply pinning
  const pinnedAllContent = useMemo<UnifiedPost[]>(() => {
    const orderMap = new Map(PINNED_SLUGS.map((slug, idx) => [slug, idx]));
    const pinned: UnifiedPost[] = [];
    const rest: UnifiedPost[] = [];

    allContentSorted.forEach((post) => {
      const order = orderMap.get(post.slug || post.id);
      if (order !== undefined) {
        pinned[order] = post;
      } else {
        rest.push(post);
      }
    });

    return [...pinned.filter(Boolean), ...rest];
  }, [allContentSorted]);

  // Filter content based on search and category
  const filteredContent = useMemo(() => {
    let dataToSearch = pinnedAllContent;

    // Apply category filter
    if (selectedCategory === NDA_OPTION) {
      if (!ndaApproved) return [];
      dataToSearch = ndaPosts.map((p) => ({
        id: p.slug,
        title: p.title,
        date: p.publishedAt,
        slug: p.slug,
        isApiReport: false,
        description: p.description || getPostDescription({id: p.slug, title: p.title, date: p.publishedAt}),
        category: p.category,
      }));
    } else if (selectedCategory === MARKET_UPDATES_OPTION) {
      dataToSearch = pinnedAllContent.filter(
        (p) => p.category?.toLowerCase().includes("market") || p.slug?.toLowerCase().includes("market")
      );
    } else if (selectedCategory !== "All") {
      dataToSearch = pinnedAllContent.filter((p) => p.category === selectedCategory);
    }

    // Apply search filter
    if (!searchQuery.trim()) return dataToSearch;

    const query = searchQuery.toLowerCase();
    return dataToSearch.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descMatch = (item.description || "").toLowerCase().includes(query);
      const categoryMatch = (item.category || "").toLowerCase().includes(query);
      return titleMatch || descMatch || categoryMatch;
    });
  }, [searchQuery, selectedCategory, pinnedAllContent, ndaPosts, ndaApproved]);

  // Session setup
  useEffect(() => {
    config.supabaseClient?.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const sub = config.supabaseClient?.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    })?.data.subscription;
    return () => sub && sub.unsubscribe();
  }, []);

  // NDA check
  const checkNda = useCallback(async () => {
    if (!session) {
      toast({ title: "Please sign in to view the files", status: "error" });
      return false;
    }
    setNdaLoading(true);
    try {
      const { data: status } = await axios.post(
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
      if (status === "Approved") {
        setNdaApproved(true);
        return true;
      }
      if (status === "Pending: Waiting for NDA Process") {
        const { data: meta } = await axios.post(
          "https://gsqmwxqgqrgzhlhmbscg.supabase.co/rest/v1/rpc/get_nda_metadata",
          {},
          {
            headers: {
              apikey: config.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setNdaMetadata(meta.metadata);
        setShowNdaDocModal(true);
        return false;
      }
      toast({ title: status, status: "error" });
      return false;
    } catch (e: any) {
      toast({ title: e.message || "NDA check failed", status: "error" });
      return false;
    } finally {
      setNdaLoading(false);
    }
  }, [session, toast]);

  const onCategoryChange = async (cat: string) => {
    if (cat === NDA_OPTION) {
      const ok = await checkNda();
      if (!ok) return;
    }
    setSelectedCategory(cat);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const formatted = formatShortDate(dateStr);
    return formatted.toUpperCase();
  };

  // Get post URL - route special posts to dedicated pages
  const getPostUrl = (post: UnifiedPost) => {
    if (post.isApiReport) {
      return `/reports/${post.id}`;
    }
    
    // Special posts with dedicated pages
    if (post.slug === 'general/ai-powered-berkshire-hathaway') {
      return '/ai-powered-berkshire';
    }
    if (post.slug === 'general/sell-the-wall-featured') {
      return '/sell-the-wall';
    }
    
    // Default community post route
    return `/community/${post.slug}`;
  };

  // Handle navigation
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Box 
      bg="#f8fafc" 
      minH="100vh" 
      maxW="480px" 
      mx="auto"
      fontFamily="'Manrope', sans-serif"
      position="relative"
      pb={6}
    >
      {/* Sticky Header/Nav */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={50}
        bg="rgba(248, 250, 252, 0.95)"
        backdropFilter="blur(8px)"
        borderBottom="1px solid"
        borderColor="#f1f5f9"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          p={4}
          h="64px"
        >
          {/* Back Button */}
          <Box
            as="button"
            onClick={handleBackClick}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="40px"
            h="40px"
            borderRadius="full"
            bg="white"
            boxShadow="sm"
            border="1px solid"
            borderColor="#e2e8f0"
            transition="all 0.2s"
            _hover={{
              bg: "#f8fafc",
              transform: "scale(1.05)",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
          >
            <Icon as={FiArrowLeft} boxSize={5} color="#0d141b" />
          </Box>

          {/* Right Icons */}
          <HStack spacing={3}>
            {/* Search Button */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="40px"
              h="40px"
              borderRadius="full"
              transition="all 0.2s"
              _hover={{
                bg: "rgba(43, 140, 238, 0.1)",
              }}
            >
              <Icon as={FiSearch} boxSize={6} color="#0d141b" />
            </Box>

            {/* Menu Button */}
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="40px"
              h="40px"
              borderRadius="full"
              transition="all 0.2s"
              _hover={{
                bg: "rgba(43, 140, 238, 0.1)",
              }}
            >
              <Icon as={FiMenu} boxSize={6} color="#0d141b" />
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box px={5} pt={6} pb={12}>
        {/* Page Title - LEFT ALIGNED */}
        <VStack spacing={2} align="flex-start" mb={8}>
          <Text 
            fontSize="32px" 
            fontWeight="700" 
            lineHeight="1.15" 
            color="#0d141b"
            letterSpacing="-0.02em"
            textAlign="left"
          >
            Latest Updates from <br/>
            <Text as="span" color="#2b8cee">
              Hushh Technologies
            </Text>
          </Text>
          <Text 
            fontSize="16px" 
            fontWeight="500" 
            color="#4A4A4A" 
            lineHeight="1.5"
            mt={1}
            textAlign="left"
          >
            Insights, news, and privacy technology updates.
          </Text>
        </VStack>

        {/* Search and Filter */}
        <VStack spacing={4} mb={8}>
          {/* Search Input */}
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="56px" pl={3}>
              <Icon as={FiSearch} boxSize={5} color="#94a3b8" />
            </InputLeftElement>
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              borderColor="#cfdbe7"
              borderRadius="lg"
              h="56px"
              pl={12}
              fontSize="16px"
              color="#0d141b"
              _placeholder={{ color: "#94a3b8" }}
              _focus={{
                borderColor: "#2b8cee",
                boxShadow: "0 0 0 1px #2b8cee"
              }}
              _hover={{ borderColor: "#a1b5c8" }}
              boxShadow="sm"
            />
          </InputGroup>

          {/* Category Dropdown */}
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            bg="white"
            borderColor="#cfdbe7"
            borderRadius="lg"
            h="56px"
            fontSize="16px"
            color="#0d141b"
            _focus={{
              borderColor: "#2b8cee",
              boxShadow: "0 0 0 1px #2b8cee"
            }}
            _hover={{ borderColor: "#a1b5c8" }}
            boxShadow="sm"
            icon={<></>}
            sx={{
              '& option': {
                bg: 'white',
                color: '#0d141b',
              }
            }}
          >
            {dropdownOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "All" ? "Category: All" : toTitleCase(opt)}
              </option>
            ))}
          </Select>
        </VStack>

        {/* Blog Post List */}
        {apiLoading ? (
          <Box textAlign="center" py={12}>
            <Box
              w={8}
              h={8}
              border="2px solid"
              borderColor="#e2e8f0"
              borderTopColor="#2b8cee"
              borderRadius="full"
              animation="spin 1s linear infinite"
              mx="auto"
            />
          </Box>
        ) : filteredContent.length > 0 ? (
          <VStack spacing={0} align="stretch">
            {filteredContent.map((post, index) => (
              <Box key={post.id}>
                {/* Post Article */}
                <Box 
                  as={Link}
                  to={getPostUrl(post)}
                  display="block"
                  py={6}
                  _hover={{ '& h2': { color: '#2b8cee' } }}
                  cursor="pointer"
                  role="group"
                >
                  {/* Date with line */}
                  <HStack spacing={2} mb={3}>
                    <Text 
                      fontSize="12px" 
                      fontWeight="700" 
                      letterSpacing="0.05em" 
                      color="#2b8cee"
                      textTransform="uppercase"
                    >
                      {formatDisplayDate(post.date)}
                    </Text>
                    <Box h="1px" w={8} bg="#2b8cee" opacity={0.2} />
                  </HStack>

                  {/* Title */}
                  <Text 
                    as="h2"
                    fontSize="20px" 
                    fontWeight="700" 
                    color="#0d141b" 
                    lineHeight="1.3"
                    mb={3}
                    transition="color 0.2s"
                    noOfLines={2}
                    textAlign="left"
                  >
                    {post.title}
                  </Text>

                  {/* Description */}
                  <Text 
                    fontSize="16px" 
                    color="#4A4A4A" 
                    lineHeight="1.6"
                    noOfLines={3}
                    mb={3}
                    textAlign="left"
                  >
                    {getPostDescription(post)}
                  </Text>

                  {/* Read More */}
                  <HStack 
                    spacing={1} 
                    color="#2b8cee" 
                    fontSize="14px" 
                    fontWeight="700"
                    _groupHover={{ '& svg': { transform: 'translateX(4px)' } }}
                  >
                    <Text>Read More</Text>
                    <Icon 
                      as={FiChevronRight} 
                      boxSize={4} 
                      transition="transform 0.2s"
                    />
                  </HStack>
                </Box>

                {/* Divider (except last) */}
                {index < filteredContent.length - 1 && (
                  <Box h="1px" w="full" bg="#f1f5f9" />
                )}
              </Box>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={12}>
            <Text fontSize="16px" color="#4A4A4A" mb={2}>
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : selectedCategory === NDA_OPTION && !ndaApproved
                ? "Please complete NDA approval to view sensitive documents"
                : "No content available"}
            </Text>
            {searchQuery && (
              <Text fontSize="14px" color="#94a3b8">
                Try adjusting your search terms or browse by category
              </Text>
            )}
          </Box>
        )}
      </Box>

      {/* NDA Modals */}
      <NDARequestModal
        isOpen={showNdaModal}
        onClose={() => setShowNdaModal(false)}
        session={session}
        onSubmit={() => {}}
      />
      <NDADocumentModal
        isOpen={showNdaDocModal}
        onClose={() => setShowNdaDocModal(false)}
        session={session}
        ndaMetadata={ndaMetadata}
        onAccept={() => {
          setNdaApproved(true);
          setShowNdaDocModal(false);
        }}
      />

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default CommunityList;
