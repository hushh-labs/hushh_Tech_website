import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Icon,
  IconButton,
  useClipboard,
  InputGroup,
  InputRightElement,
  usePrefersReducedMotion,
  Collapse,
  Image,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useFooterVisibility } from "../../utils/useFooterVisibility";
import {
  Copy,
  Check,
  ExternalLink,
  Target,
  Droplets,
  Gauge,
  Activity,
  Briefcase,
  Layers,
  Zap,
  Clock3,
  Circle,
  Share2,
  Mail,
  MessageCircle,
} from "lucide-react";
import { FaApple } from "react-icons/fa";
import { SiGooglepay } from "react-icons/si";
import { SocialIcon } from 'react-social-icons';
import { CheckIcon, LinkIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import resources from "../../resources/resources";
import { generateInvestorProfile } from "../../services/investorProfile/apiClient";
import { downloadHushhGoldPass } from "../../services/walletPass";
import { InvestorProfile, FIELD_LABELS, VALUE_LABELS } from "../../types/investorProfile";
import DeveloperSettings from "../../components/DeveloperSettings";
import { OnboardingData } from "../../types/onboarding";

interface FormState {
  name: string;
  email: string;
  age: number | "";
  phoneCountryCode: string;
  phoneNumber: string;
  organisation: string;
  // Onboarding fields
  accountType: string;
  selectedFund: string;
  referralSource: string;
  citizenshipCountry: string;
  residenceCountry: string;
  accountStructure: string;
  legalFirstName: string;
  legalLastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  addressPhoneNumber: string;
  dateOfBirth: string;
  initialInvestmentAmount: number | "";
  recurringInvestmentEnabled: boolean;
  recurringFrequency: string;
  recurringAmount: number | "";
  recurringDayOfMonth: number | "";
}

const defaultFormState: FormState = {
  name: "",
  email: "",
  age: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  organisation: "",
  // Onboarding defaults
  accountType: "",
  selectedFund: "",
  referralSource: "",
  citizenshipCountry: "",
  residenceCountry: "",
  accountStructure: "",
  legalFirstName: "",
  legalLastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  addressPhoneNumber: "",
  dateOfBirth: "",
  initialInvestmentAmount: "",
  recurringInvestmentEnabled: false,
  recurringFrequency: "",
  recurringAmount: "",
  recurringDayOfMonth: "",
};

const primaryCtaStyles = {
  borderRadius: "full",
  fontWeight: "500",
  bgGradient: "linear(to-r, rgb(0, 169, 224), rgb(109, 211, 239))",
  color: "white",
  boxShadow: "0 10px 25px rgba(0, 169, 224, 0.35)",
  _disabled: {
    bgGradient: "linear(to-r, rgb(0, 169, 224), rgb(109, 211, 239))",
    boxShadow: "0 10px 25px rgba(0, 169, 224, 0.35)",
  },
  _hover: {
    bgGradient: "linear(to-r, rgb(0, 150, 200), rgb(90, 195, 230))",
    boxShadow: "0 12px 30px rgba(0, 150, 200, 0.45)",
    _disabled: {
      bgGradient: "linear(to-r, rgb(0, 169, 224), rgb(109, 211, 239))",
      boxShadow: "0 10px 25px rgba(0, 169, 224, 0.35)",
    },
  },
  _active: {
    transform: "scale(0.98)",
    boxShadow: "0 6px 18px rgba(0, 120, 170, 0.45)",
  },
  _focusVisible: {
    outline: "2px solid rgba(0, 169, 224, 0.9)",
    outlineOffset: "2px",
  },
};

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmerSweep = keyframes`
  0% { transform: translateX(-120%); opacity: 0; }
  20% { opacity: 0.4; }
  100% { transform: translateX(120%); opacity: 0; }
`;

const pulse = keyframes`
  0% { transform: scale(0.98); box-shadow: 0 8px 20px rgba(15,23,42,0.12); }
  100% { transform: scale(1); box-shadow: 0 10px 24px rgba(15,23,42,0.14); }
`;

const HushhUserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isFooterVisible = useFooterVisibility();
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [userId, setUserId] = useState<string | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [isApplePassLoading, setIsApplePassLoading] = useState(false);
  const [isGooglePassLoading, setIsGooglePassLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedFlash, setCopiedFlash] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [nameShimmer, setNameShimmer] = useState(true);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const profileUrl = profileSlug ? `https://hushhtech.com/investor/${profileSlug}` : "";
  const { hasCopied, onCopy } = useClipboard(profileUrl);
  const heroAnimation = prefersReducedMotion ? undefined : `${fadeUp} 0.35s ease-out`;
  const headingAnimation = prefersReducedMotion ? undefined : `${fadeUp} 0.35s ease-out 0.05s both`;
  const inputBaseStyles = {
    h: "52px",
    borderRadius: "14px",
    bg: "white",
    borderColor: "#D1D5DB",
    px: 4,
    fontSize: "16px",
    fontWeight: 500,
    color: "#0B1120",
    _hover: { borderColor: "#CBD5E1" },
    _focus: {
      borderColor: "#00A9E0",
      boxShadow: "0 0 0 2px rgba(0,169,224,0.18)",
    },
    _placeholder: { color: "#9CA3AF" },
    transition: "border-color 0.16s ease, box-shadow 0.16s ease",
  } as const;
  const labelBaseStyles = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    mb: "8px",
  } as const;
  const focusLabelStyles = {
    "&:focus-within label": {
      color: "#0f172a",
      transform: prefersReducedMotion ? undefined : "translateY(-1px)",
      transition: "transform 0.15s ease, color 0.15s ease",
    },
  } as const;
  const ctaActiveState = prefersReducedMotion
    ? { boxShadow: "0 6px 18px rgba(0, 120, 170, 0.45)" }
    : { transform: "scale(0.97)", boxShadow: "0 6px 18px rgba(0, 120, 170, 0.45)" };
  const confidenceWidths = {
    HIGH: "100%",
    MEDIUM: "60%",
    LOW: "35%",
  } as const;
  const getFieldIcon = (fieldName: string) => {
    const map: Record<string, any> = {
      primary_goal: Target,
      liquidity_need: Droplets,
      risk_tolerance: Gauge,
      engagement_style: Activity,
      experience_level: Briefcase,
      asset_class_preference: Layers,
      investment_horizon_years: Clock3,
      typical_ticket_size: Zap,
      annual_investing_capacity: Zap,
      sector_preferences: Layers,
      volatility_reaction: Gauge,
      sustainability_preference: Activity,
    };
    return map[fieldName] || Circle;
  };
  const renderCheckmark = (value: string | number | "") =>
    value !== "" ? (
      <InputRightElement pointerEvents="none">
        <CheckIcon color="#00A9E0" boxSize={3.5} />
      </InputRightElement>
    ) : null;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = resources.config.supabaseClient;
        if (!supabase) {
          toast({
            title: "Error",
            description: "Supabase client not available",
            status: "error",
            duration: 5000,
          });
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        setUserId(user.id);

        // Prefill form with user metadata
        const fullName =
          (user.user_metadata?.full_name as string) ||
          [user.user_metadata?.first_name, user.user_metadata?.last_name]
            .filter(Boolean)
            .join(" ") ||
          "";

        setForm((prev) => ({
          ...prev,
          name: fullName || prev.name,
          email: user.email || prev.email,
          organisation: (user.user_metadata?.company as string) || prev.organisation,
        }));

        // Check if investor profile already exists
        const { data: existingProfile } = await supabase
          .from("investor_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (existingProfile && existingProfile.investor_profile) {
          setInvestorProfile(existingProfile.investor_profile);
          setProfileSlug(existingProfile.slug || null);
          
          // Clean phone number to remove country code if it's already included
          const countryCode = existingProfile.phone_country_code || "+1";
          const cleanedPhoneNumber = cleanPhoneNumber(
            existingProfile.phone_number || "",
            countryCode
          );
          
          setForm((prev) => ({
            ...prev,
            name: existingProfile.name || fullName,
            email: existingProfile.email || user.email || "",
            age: existingProfile.age || "",
            phoneCountryCode: countryCode,
            phoneNumber: cleanedPhoneNumber,
            organisation: existingProfile.organisation || "",
          }));
        }

        // Load onboarding data
        const { data: onboardingData } = await supabase
          .from("onboarding_data")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (onboardingData) {
          // Calculate age from date of birth if available
          const calculatedAge = onboardingData.date_of_birth
            ? new Date().getFullYear() - new Date(onboardingData.date_of_birth).getFullYear()
            : "";

          setForm((prev) => {
            // Clean phone number from onboarding data too
            const onboardingCountryCode = onboardingData.phone_country_code || prev.phoneCountryCode;
            const onboardingPhoneNumber = cleanPhoneNumber(
              onboardingData.phone_number || prev.phoneNumber,
              onboardingCountryCode
            );

            return {
              ...prev,
              age: calculatedAge || prev.age,
              phoneCountryCode: onboardingCountryCode,
              phoneNumber: onboardingPhoneNumber,
            accountType: onboardingData.account_type || "",
            selectedFund: onboardingData.selected_fund || "",
            referralSource: onboardingData.referral_source || "",
            citizenshipCountry: onboardingData.citizenship_country || "",
            residenceCountry: onboardingData.residence_country || "",
            accountStructure: onboardingData.account_structure || "",
            legalFirstName: onboardingData.legal_first_name || "",
            legalLastName: onboardingData.legal_last_name || "",
            addressLine1: onboardingData.address_line_1 || "",
            addressLine2: onboardingData.address_line_2 || "",
            city: onboardingData.city || "",
            state: onboardingData.state || "",
            zipCode: onboardingData.zip_code || "",
            addressPhoneNumber: onboardingData.address_phone_number || "",
            dateOfBirth: onboardingData.date_of_birth || "",
            initialInvestmentAmount: onboardingData.initial_investment_amount || "",
            recurringInvestmentEnabled: onboardingData.recurring_investment_enabled || false,
              recurringFrequency: onboardingData.recurring_frequency || "",
              recurringAmount: onboardingData.recurring_amount || "",
              recurringDayOfMonth: onboardingData.recurring_day_of_month || "",
            };
          });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        toast({
          title: "Error",
          description: "Could not verify authentication",
          status: "error",
          duration: 5000,
        });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    setShowPreview(!!investorProfile);
  }, [investorProfile]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!profileUrl) return;
    setShimmerActive(true);
    const stopFirst = setTimeout(() => setShimmerActive(false), 1000);
    const restart = setTimeout(() => setShimmerActive(true), 4200);
    const stopSecond = setTimeout(() => setShimmerActive(false), 5200);
    return () => {
      clearTimeout(stopFirst);
      clearTimeout(restart);
      clearTimeout(stopSecond);
    };
  }, [profileUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setNameShimmer(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to clean phone number by removing country code if present
  const cleanPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    if (!phoneNumber || !countryCode) return phoneNumber;
    
    // Remove the + from country code to get just the digits
    const dialCode = countryCode.replace('+', '');
    
    // If phone number starts with the country code, remove it
    if (phoneNumber.startsWith(dialCode)) {
      return phoneNumber.slice(dialCode.length);
    }
    
    return phoneNumber;
  };

  const handleChange = (key: keyof FormState, value: string) => {
    // Validate phone number length (E.164 standard: max 15 digits)
    if (key === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 15) {
        return; // Don't update if exceeds limit
      }
    }
    
    setForm((prev) => ({ ...prev, [key]: key === "age" ? Number(value) || "" : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phoneCountryCode || !form.phoneNumber || form.age === "") {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      // Generate investor profile using AI
      const result = await generateInvestorProfile({
        name: form.name,
        email: form.email,
        age: typeof form.age === "number" ? form.age : Number(form.age),
        phone_country_code: form.phoneCountryCode,
        phone_number: form.phoneNumber,
        organisation: form.organisation || undefined,
      });

      if (!result.success || !result.profile) {
        throw new Error(result.error || "Failed to generate investor profile");
      }

      setInvestorProfile(result.profile);

      // Save to Supabase
      if (userId) {
        const supabase = resources.config.supabaseClient;
        if (supabase) {
          const { data: savedProfile, error: saveError } = await supabase
            .from("investor_profiles")
            .upsert({
              user_id: userId,
              name: form.name,
              email: form.email,
              age: typeof form.age === "number" ? form.age : Number(form.age),
              phone_country_code: form.phoneCountryCode,
              phone_number: form.phoneNumber,
              organisation: form.organisation || null,
              investor_profile: result.profile,
              user_confirmed: true,
              confirmed_at: new Date().toISOString(),
            })
            .select('slug')
            .single();

          if (saveError) {
            console.error("Error saving to Supabase:", saveError);
          } else if (savedProfile) {
            // Update slug state so share section appears immediately
            setProfileSlug(savedProfile.slug || null);
            await triggerWalletPassDownload("apple", setIsApplePassLoading, savedProfile.slug || profileSlug);
          }
        }
      }

      toast({
        title: "Success",
        description: "Investor profile generated successfully",
        status: "success",
        duration: 4000,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate profile",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerWalletPassDownload = async (
    wallet: "apple" | "google",
    setLoading: (value: boolean) => void,
    slugOverride?: string | null
  ) => {
    const passSlug = slugOverride ?? profileSlug;
    setLoading(true);
    try {
      await downloadHushhGoldPass({
        name: form.name || "Hushh Investor",
        email: form.email,
        organisation: form.organisation,
        slug: passSlug,
        userId,
        investmentAmount: typeof form.initialInvestmentAmount === "number"
          ? form.initialInvestmentAmount
          : Number(form.initialInvestmentAmount) || undefined,
      });
      toast({
        title: `Hushh Gold card ready for ${wallet === "apple" ? "Apple Wallet" : "Google Wallet"}`,
        description:
          wallet === "apple"
            ? "Open the downloaded pass to add it to Apple Wallet."
            : "Open the downloaded pass to add it to Google Wallet.",
        status: "success",
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: `${wallet === "apple" ? "Apple" : "Google"} Wallet card failed`,
        description: error instanceof Error ? error.message : "Could not generate your Hushh Gold pass.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleWalletPass = async (slugOverride?: string | null) => {
    await triggerWalletPassDownload("google", setIsGooglePassLoading, slugOverride);
  };

  const handleFieldUpdate = async (fieldName: string, newValue: any) => {
    if (!investorProfile || !userId) return;

    const updatedProfile = {
      ...investorProfile,
      [fieldName]: {
        ...investorProfile[fieldName as keyof InvestorProfile],
        value: newValue,
      },
    };

    setInvestorProfile(updatedProfile);
    setEditingField(null);

    // Save to Supabase
    const supabase = resources.config.supabaseClient;
    if (supabase) {
      await supabase
        .from("investor_profiles")
        .update({ investor_profile: updatedProfile })
        .eq("user_id", userId);
    }

    toast({
      title: "Updated",
      description: "Field updated successfully",
      status: "success",
      duration: 2000,
    });
  };

  const getConfidenceChip = (confidence: number) => {
    const label = confidence >= 0.7 ? "HIGH" : confidence >= 0.4 ? "MEDIUM" : "LOW";
    const tone =
      label === "HIGH" ? "#34C759" : label === "MEDIUM" ? "#FFD60A" : "#8E8E93";
    const surface =
      label === "HIGH" ? "rgba(52, 199, 89, 0.08)" : label === "MEDIUM" ? "rgba(255, 214, 10, 0.12)" : "rgba(142, 142, 147, 0.12)";
    const border =
      label === "HIGH" ? "rgba(52, 199, 89, 0.6)" : label === "MEDIUM" ? "rgba(255, 214, 10, 0.65)" : "rgba(142, 142, 147, 0.55)";
    return (
      <Box
        px={3.5}
        py={1.5}
        border={`1px solid ${border}`}
        borderRadius="full"
        fontSize="xs"
        fontWeight="500"
        letterSpacing="0.08em"
        color={tone}
        bg={surface}
        minH="28px"
        display="inline-flex"
        alignItems="center"
        _groupHover={{ borderColor: border }}
        _groupActive={{ bg: surface, borderColor: border }}
      >
        {label}
      </Box>
    );
  };

  const renderFieldEditor = (fieldName: string, field: any) => {
    const schema = {
      primary_goal: ["capital_preservation", "steady_income", "long_term_growth", "aggressive_growth", "speculation"],
      investment_horizon_years: ["<3_years", "3_5_years", "5_10_years", ">10_years"],
      risk_tolerance: ["very_low", "low", "moderate", "high", "very_high"],
      liquidity_need: ["low", "medium", "high"],
      experience_level: ["beginner", "intermediate", "advanced"],
      typical_ticket_size: ["micro_<1k", "small_1k_10k", "medium_10k_50k", "large_>50k"],
      annual_investing_capacity: ["<5k", "5k_20k", "20k_100k", ">100k"],
      asset_class_preference: ["public_equities", "mutual_funds_etfs", "fixed_income", "real_estate", "startups_private_equity", "crypto_digital_assets", "cash_equivalents"],
      sector_preferences: ["technology", "consumer_internet", "fintech", "healthcare", "real_estate", "energy_climate", "industrial", "other"],
      volatility_reaction: ["sell_to_avoid_more_loss", "hold_and_wait", "buy_more_at_lower_prices"],
      sustainability_preference: ["not_important", "nice_to_have", "important", "very_important"],
      engagement_style: ["very_passive_just_updates", "collaborative_discuss_key_decisions", "hands_on_active_trader"],
    };

    const options = schema[fieldName as keyof typeof schema] || [];
    const isMultiSelect = fieldName === "asset_class_preference" || fieldName === "sector_preferences";

    if (isMultiSelect) {
      return (
        <CheckboxGroup
          value={Array.isArray(field.value) ? field.value : [field.value]}
          onChange={(values) => handleFieldUpdate(fieldName, values)}
        >
          <Stack spacing={2}>
            {options.map((option) => (
              <Checkbox key={option} value={option}>
                {VALUE_LABELS[option as keyof typeof VALUE_LABELS] || option}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      );
    }

    return (
      <Select
        value={field.value}
        onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
        size="sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {VALUE_LABELS[option as keyof typeof VALUE_LABELS] || option}
          </option>
        ))}
      </Select>
    );
  };

  const triggerCopy = () => {
    if (!profileUrl) return;
    onCopy();
    setCopiedFlash(true);
    setTimeout(() => setCopiedFlash(false), 1200);
  };

  const handleOpenProfile = () => {
    if (!profileUrl) return;
    window.open(profileUrl, "_blank");
  };

  const handleShare = () => {
    if (navigator.share && profileUrl) {
      navigator.share({ title: "Hushh Investor Profile", url: profileUrl }).catch(() => {
        /* ignore cancellation */
      });
    } else {
      triggerCopy();
    }
  };

  const handleLongPressStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      handleShare();
    }, 550);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <Box 
      minH="100vh" 
      bg="#F8FAFC"
      fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    >
      {/* Main Container matching Step3 pattern */}
      <Box
        as="form"
        onSubmit={handleSubmit}
        position="relative"
        display="flex"
        flexDirection="column"
        minH="100vh"
        maxW="500px"
        mx="auto"
        bg="white"
        boxShadow="xl"
        borderX="1px solid"
        borderColor="#F1F5F9"
        overflow="hidden"
      >
        {/* Main Content with bottom padding for fixed footer */}
        <Box flex="1" px={6} pb="200px">
          {/* Header Section - 22px title, 14px subtitle, center aligned */}
          <Box 
            pt={8} 
            pb={6} 
            textAlign="center"
            animation={heroAnimation}
          >
            <Text
              fontSize="22px"
              fontWeight="800"
              color="#111827"
              lineHeight="1.2"
              letterSpacing="-0.02em"
              mb={2}
            >
              Investor Profile
            </Text>
            <Text 
              fontSize="14px" 
              fontWeight="600" 
              color="#6B7280"
              letterSpacing="0.02em"
              textTransform="uppercase"
            >
              {form.name ? `Hello, ${form.name}` : "Complete Your Profile"}
            </Text>
          </Box>

        {/* Profile URL Share Card - Shows when profile is created */}
        {profileSlug && profileUrl && (
          <Box 
            px={{ base: 0, md: 2 }} 
            mt={6}
            animation={prefersReducedMotion ? undefined : `${fadeUp} 0.3s ease-out 0.1s both`}
          >
            <Box
              bg="linear-gradient(135deg, #00A9E0 0%, #6DD3EF 100%)"
              borderRadius="20px"
              p={{ base: 5, md: 6 }}
              boxShadow="0 10px 40px rgba(0, 169, 224, 0.25)"
              position="relative"
              overflow="hidden"
            >
              {/* Background Pattern */}
              <Box
                position="absolute"
                top={0}
                right={0}
                bottom={0}
                left={0}
                opacity={0.1}
                bgImage="radial-gradient(circle at 20px 20px, white 2px, transparent 0)"
                bgSize="40px 40px"
                pointerEvents="none"
              />

              <VStack align="stretch" spacing={4} position="relative">
                <HStack justify="space-between" align="flex-start">
                  <VStack align="flex-start" spacing={1}>
                    <HStack spacing={2}>
                      <Icon as={Share2} color="white" boxSize={5} />
                      <Text
                        fontSize="18px"
                        fontWeight="500"
                        color="white"
                        letterSpacing="-0.01em"
                      >
                        Your Investor Profile
                      </Text>
                    </HStack>
                    <Text fontSize="14px" color="rgba(255,255,255,0.9)">
                      Share this link to let others view your profile
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="Open profile in new tab"
                    icon={<Icon as={ExternalLink} />}
                    onClick={handleOpenProfile}
                    size="sm"
                    bg="rgba(255,255,255,0.2)"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.3)" }}
                    _active={{ transform: "scale(0.95)" }}
                    borderRadius="10px"
                  />
                </HStack>

                {/* URL Display Box */}
                <Box
                  bg="white"
                  borderRadius="14px"
                  p={4}
                  boxShadow="0 4px 12px rgba(0,0,0,0.08)"
                >
                  <HStack spacing={3} justify="space-between">
                    <HStack spacing={2} flex={1} minW={0}>
                      <Icon as={LinkIcon} color="#00A9E0" boxSize={4} />
                      <Text
                        fontSize="14px"
                        fontWeight="500"
                        color="#0B1120"
                        wordBreak="break-all"
                        flex={1}
                      >
                        {profileUrl}
                      </Text>
                    </HStack>
                    <IconButton
                      aria-label="Copy link"
                      icon={<Icon as={hasCopied ? Check : Copy} boxSize={4} />}
                      onClick={triggerCopy}
                      size="sm"
                      colorScheme={hasCopied ? "green" : "gray"}
                      bg={hasCopied ? "#34C759" : "#F3F4F6"}
                      color={hasCopied ? "white" : "#111827"}
                      _hover={{ bg: hasCopied ? "#34C759" : "#E5E7EB" }}
                      _active={{ transform: "scale(0.95)" }}
                      borderRadius="10px"
                      transition="all 0.2s ease"
                    />
                  </HStack>
                </Box>

                {/* Share Buttons */}
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="13px" fontWeight="500" color="white">
                    Share via
                  </Text>
                  <HStack spacing={3} justify="center" flexWrap="wrap">
                    <Box
                      onClick={() => {
                        const text = encodeURIComponent("Check out my Hushh Investor Profile");
                        const url = encodeURIComponent(profileUrl);
                        window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
                      }}
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                      _active={{ transform: "scale(0.95)" }}
                    >
                      <SocialIcon 
                        network="whatsapp" 
                        style={{ height: 50, width: 50 }}
                        bgColor="rgba(255,255,255,0.2)"
                        fgColor="white"
                      />
                    </Box>
                    <Box
                      onClick={() => {
                        const text = encodeURIComponent("Check out my Hushh Investor Profile");
                        const url = encodeURIComponent(profileUrl);
                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                      }}
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                      _active={{ transform: "scale(0.95)" }}
                    >
                      <SocialIcon 
                        network="x" 
                        style={{ height: 50, width: 50 }}
                        bgColor="rgba(255,255,255,0.2)"
                        fgColor="white"
                      />
                    </Box>
                    <Box
                      onClick={() => {
                        const subject = encodeURIComponent("My Hushh Investor Profile");
                        const body = encodeURIComponent(`Check out my investor profile: ${profileUrl}`);
                        window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      }}
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                      _active={{ transform: "scale(0.95)" }}
                    >
                      <SocialIcon 
                        network="email" 
                        style={{ height: 50, width: 50 }}
                        bgColor="rgba(255,255,255,0.2)"
                        fgColor="white"
                      />
                    </Box>
                    <Box
                      onClick={() => {
                        const url = encodeURIComponent(profileUrl);
                        const title = encodeURIComponent("My Hushh Investor Profile");
                        const summary = encodeURIComponent("Check out my investor profile on Hushh");
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
                      }}
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                      _active={{ transform: "scale(0.95)" }}
                    >
                      <SocialIcon 
                        network="linkedin" 
                        style={{ height: 50, width: 50 }}
                        bgColor="rgba(255,255,255,0.2)"
                        fgColor="white"
                      />
                    </Box>
                    <Box
                      onClick={triggerCopy}
                      cursor="pointer"
                      transition="transform 0.2s ease"
                      _hover={{ transform: "scale(1.1)" }}
                      _active={{ transform: "scale(0.95)" }}
                      bg="rgba(255,255,255,0.2)"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="50px"
                      h="50px"
                      border="2px solid rgba(255,255,255,0.3)"
                    >
                      <Icon 
                        as={hasCopied ? Check : Copy} 
                        boxSize={6} 
                        color="white"
                      />
                    </Box>
                  </HStack>
                </VStack>

                <Box
                  bg="rgba(255,255,255,0.1)"
                  border="1px solid rgba(255,255,255,0.25)"
                  borderRadius="14px"
                  p={4}
                >
                  <VStack align="stretch" spacing={3}>
                    <Button
                      onClick={() => triggerWalletPassDownload("apple", setIsApplePassLoading)}
                      isLoading={isApplePassLoading}
                      leftIcon={<Icon as={FaApple} boxSize={6} />}
                      bg="white"
                      color="#0B1120"
                      borderRadius="999px"
                      border="1px solid #0B1120"
                      h="46px"
                      px={4}
                      _hover={{ bg: "#FFFFFF" }}
                      _active={{ bg: "#F5F5F5", transform: "scale(0.98)" }}
                    >
                      Add to Apple Wallet
                    </Button>
                    <Button
                      onClick={() => triggerGoogleWalletPass()}
                      isLoading={isGooglePassLoading}
                      leftIcon={<Icon as={SiGooglepay} boxSize={6} />}
                      bg="white"
                      color="#0B1120"
                      borderRadius="999px"
                      border="1px solid #0B1120"
                      h="46px"
                      px={4}
                      _hover={{ bg: "#FFFFFF" }}
                      _active={{ bg: "#F5F5F5", transform: "scale(0.98)" }}
                    >
                      Add to Google Wallet
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        )}

        <Box animation={headingAnimation} px={{ base: 1, md: 2 }} mt={2}>
          <Heading fontSize="24px" fontWeight="500" lineHeight="1.2" color="#0B1120" mb={4}>
            Your Hushh Profile
          </Heading>
          <Box position="relative" w="100%" h="1px" bg="#E5E7EB" mb={4}>
            <Box
              position="absolute"
              left={0}
              top="50%"
              transform="translateY(-50%)"
              w="16px"
              h="2px"
              bg="#00A9E0"
            />
          </Box>

          <VStack align="stretch" spacing={5}>
            <FormControl isRequired sx={focusLabelStyles}>
              <FormLabel {...labelBaseStyles}>
                Full Name <Text as="span" color="#B91C1C" fontSize="12px" ml={1}>*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  {...inputBaseStyles}
                  ref={firstFieldRef}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
                {renderCheckmark(form.name)}
              </InputGroup>
            </FormControl>

            <FormControl isRequired sx={focusLabelStyles}>
              <FormLabel {...labelBaseStyles}>
                Email <Text as="span" color="#B91C1C" fontSize="12px" ml={1}>*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  {...inputBaseStyles}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your.email@company.com"
                />
                {renderCheckmark(form.email)}
              </InputGroup>
            </FormControl>

            <FormControl isRequired sx={focusLabelStyles}>
              <FormLabel {...labelBaseStyles}>
                Age <Text as="span" color="#B91C1C" fontSize="12px" ml={1}>*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  {...inputBaseStyles}
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="24"
                />
                {renderCheckmark(form.age)}
              </InputGroup>
            </FormControl>

            <Box>
              <HStack spacing={3} align="flex-end">
                <FormControl isRequired flex="0 0 96px" sx={focusLabelStyles}>
                  <FormLabel {...labelBaseStyles}>
                    Country Code <Text as="span" color="#B91C1C" fontSize="12px" ml={1}>*</Text>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      {...inputBaseStyles}
                      value={form.phoneCountryCode}
                      onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                      placeholder="+1"
                    />
                    {renderCheckmark(form.phoneCountryCode)}
                  </InputGroup>
                </FormControl>

                <FormControl isRequired flex={1} sx={focusLabelStyles}>
                  <FormLabel {...labelBaseStyles}>
                    Phone Number <Text as="span" color="#B91C1C" fontSize="12px" ml={1}>*</Text>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      {...inputBaseStyles}
                      value={form.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      placeholder="1234567890"
                    />
                    {renderCheckmark(form.phoneNumber)}
                  </InputGroup>
                </FormControl>
              </HStack>
            </Box>

            <FormControl sx={focusLabelStyles}>
              <FormLabel {...labelBaseStyles}>
                Organisation <Text as="span" color="#6B7280" fontWeight="500" ml={1}>(Optional)</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  {...inputBaseStyles}
                  value={form.organisation}
                  onChange={(e) => handleChange("organisation", e.target.value)}
                  placeholder="Company name"
                />
                {renderCheckmark(form.organisation)}
              </InputGroup>
            </FormControl>

            {/* Onboarding Data Fields */}
            {form.accountType && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Account Type</FormLabel>
                <Input {...inputBaseStyles} value={form.accountType} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.selectedFund && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Selected Fund</FormLabel>
                <Input {...inputBaseStyles} value={form.selectedFund} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.referralSource && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Referral Source</FormLabel>
                <Input {...inputBaseStyles} value={form.referralSource} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.citizenshipCountry && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Citizenship Country</FormLabel>
                <Input {...inputBaseStyles} value={form.citizenshipCountry} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.residenceCountry && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Residence Country</FormLabel>
                <Input {...inputBaseStyles} value={form.residenceCountry} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.accountStructure && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Account Structure</FormLabel>
                <Input {...inputBaseStyles} value={form.accountStructure} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.legalFirstName && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Legal First Name</FormLabel>
                <Input {...inputBaseStyles} value={form.legalFirstName} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.legalLastName && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Legal Last Name</FormLabel>
                <Input {...inputBaseStyles} value={form.legalLastName} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.addressLine1 && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Address Line 1</FormLabel>
                <Input {...inputBaseStyles} value={form.addressLine1} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.addressLine2 && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Address Line 2</FormLabel>
                <Input {...inputBaseStyles} value={form.addressLine2} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.city && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>City</FormLabel>
                <Input {...inputBaseStyles} value={form.city} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.state && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>State</FormLabel>
                <Input {...inputBaseStyles} value={form.state} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.zipCode && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Zip Code</FormLabel>
                <Input {...inputBaseStyles} value={form.zipCode} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.addressPhoneNumber && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Address Phone Number</FormLabel>
                <Input {...inputBaseStyles} value={form.addressPhoneNumber} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.dateOfBirth && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Date of Birth</FormLabel>
                <Input {...inputBaseStyles} value={form.dateOfBirth} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.initialInvestmentAmount !== "" && (
              <FormControl sx={focusLabelStyles}>
                <FormLabel {...labelBaseStyles}>Initial Investment Amount</FormLabel>
                <Input {...inputBaseStyles} value={`$${form.initialInvestmentAmount}`} isReadOnly bg="#F9FAFB" />
              </FormControl>
            )}

            {form.recurringInvestmentEnabled && (
              <>
                <FormControl sx={focusLabelStyles}>
                  <FormLabel {...labelBaseStyles}>Recurring Investment</FormLabel>
                  <Input {...inputBaseStyles} value="Enabled" isReadOnly bg="#F9FAFB" />
                </FormControl>

                {form.recurringFrequency && (
                  <FormControl sx={focusLabelStyles}>
                    <FormLabel {...labelBaseStyles}>Recurring Frequency</FormLabel>
                    <Input {...inputBaseStyles} value={form.recurringFrequency} isReadOnly bg="#F9FAFB" />
                  </FormControl>
                )}

                {form.recurringAmount !== "" && (
                  <FormControl sx={focusLabelStyles}>
                    <FormLabel {...labelBaseStyles}>Recurring Amount</FormLabel>
                    <Input {...inputBaseStyles} value={`$${form.recurringAmount}`} isReadOnly bg="#F9FAFB" />
                  </FormControl>
                )}

                {form.recurringDayOfMonth !== "" && (
                  <FormControl sx={focusLabelStyles}>
                    <FormLabel {...labelBaseStyles}>Recurring Day of Month</FormLabel>
                    <Input {...inputBaseStyles} value={form.recurringDayOfMonth} isReadOnly bg="#F9FAFB" />
                  </FormControl>
                )}
              </>
            )}
          </VStack>

          <Box borderBottom="1px solid #E5E7EB" mt={6} />
        </Box>

        {investorProfile && (
          <Box mt={6}>
            <Box borderTop="1px solid #E5E5EA" mb={4} />
            <HStack justify="space-between" align="center" mb={2}>
              <Text fontSize="sm" fontWeight="500" color="#111827">
                Preview generated profile
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreview((prev) => !prev)}
              >
                {showPreview ? "Hide" : "Show"} preview
              </Button>
            </HStack>
            <Collapse in={showPreview} animateOpacity={!prefersReducedMotion}>
              {profileSlug && profileUrl && (
                <Box
                  mt={2}
                  animation={prefersReducedMotion ? undefined : `${fadeUp} 0.2s ease-out`}
                >
                  <VStack align="stretch" spacing={1.5}>
                    <Text fontSize="sm" fontWeight="500" color="#0f172a">
                      Your Public Profile
                    </Text>
                    <Text fontSize="sm" color="#475467">
                      Share this link anywhere
                    </Text>
                  </VStack>

                  <Box
                    mt={3}
                    position="relative"
                    borderRadius="full"
                    border="1px solid #E2E8F0"
                    bg="#F8FAFC"
                    boxShadow="0 10px 22px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(15,23,42,0.04)"
                    overflow="hidden"
                    onClick={triggerCopy}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") triggerCopy();
                    }}
                    onPointerDown={(e) => {
                      handleLongPressStart();
                      if (!prefersReducedMotion) e.currentTarget.style.transform = "scale(0.985)";
                    }}
                    onPointerUp={(e) => {
                      handleLongPressEnd();
                      if (!prefersReducedMotion) e.currentTarget.style.transform = "scale(1)";
                    }}
                    onPointerLeave={(e) => {
                      handleLongPressEnd();
                      if (!prefersReducedMotion) e.currentTarget.style.transform = "scale(1)";
                    }}
                    transition="transform 0.12s ease, box-shadow 0.2s ease, background-color 0.2s ease"
                    animation={
                      copiedFlash && !prefersReducedMotion
                        ? `${pulse} 0.18s ease-out`
                        : undefined
                    }
                  >
                    {shimmerActive && !prefersReducedMotion && (
                      <Box
                        position="absolute"
                        inset={0}
                        pointerEvents="none"
                        overflow="hidden"
                      >
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          h="100%"
                          w="40%"
                          bgGradient="linear(to-r, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))"
                          transform="translateX(-120%) rotate(12deg)"
                          animation={`${shimmerSweep} 0.8s ease-out`}
                        />
                      </Box>
                    )}
                    <HStack spacing={3} justify="space-between" align="center" px={4} py={3}>
                      <HStack spacing={2} flex="1" minW={0}>
                        <Icon as={LinkIcon} color="#111827" boxSize={4} />
                        <Text
                          flex="1"
                          fontSize="sm"
                          color="#0f172a"
                          wordBreak="break-all"
                          fontWeight="500"
                        >
                          {profileUrl}
                        </Text>
                        {copiedFlash && (
                          <Text fontSize="xs" color="#00A9E0" fontWeight="500">
                            Copied
                          </Text>
                        )}
                      </HStack>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Copy link"
                          icon={<Icon as={hasCopied || copiedFlash ? Check : Copy} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerCopy();
                          }}
                          variant="outline"
                          size="sm"
                          colorScheme="gray"
                          borderColor="#E2E8F0"
                          bg="white"
                          _hover={{ bg: "#F8FAFC" }}
                          _active={{ transform: prefersReducedMotion ? undefined : "scale(0.95)" }}
                          transition="transform 0.12s ease"
                        />
                        <IconButton
                          aria-label="Open profile"
                          icon={<Icon as={ExternalLink} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfile();
                          }}
                          variant="outline"
                          size="sm"
                          colorScheme="gray"
                          borderColor="#E2E8F0"
                          bg="white"
                          _hover={{ bg: "#F8FAFC" }}
                          _active={{ transform: prefersReducedMotion ? undefined : "translate(2px, -1px)" }}
                          transition="transform 0.12s ease"
                        />
                      </HStack>
                    </HStack>
                  </Box>
                </Box>
              )}

              <Accordion
                allowToggle
                index={openIndex === null ? undefined : openIndex}
                onChange={(idx) => {
                  if (Array.isArray(idx)) {
                    setOpenIndex(typeof idx[0] === "number" ? idx[0] : null);
                  } else {
                    setOpenIndex(typeof idx === "number" && idx >= 0 ? idx : null);
                  }
                }}
              >
                {Object.entries(investorProfile).map(([fieldName, fieldData]: [string, any], idx) => {
                  const label = FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
                  const valueText = Array.isArray(fieldData.value)
                    ? fieldData.value.map((v: string) => VALUE_LABELS[v as keyof typeof VALUE_LABELS] || v).join(", ")
                    : VALUE_LABELS[fieldData.value as keyof typeof VALUE_LABELS] || fieldData.value;
                  const isOpen = openIndex === idx;
                  const confidenceLabel = fieldData.confidence >= 0.7 ? "HIGH" : fieldData.confidence >= 0.4 ? "MEDIUM" : "LOW";
                  return (
                    <AccordionItem
                      key={fieldName}
                      border="none"
                      borderBottom="1px solid #E5E5EA"
                      py={isOpen ? 3 : 2}
                      _last={{ borderBottom: "none" }}
                    >
                      <AccordionButton
                        role="group"
                        px={0}
                        py={isOpen ? 4 : 3}
                        minH="60px"
                        alignItems="center"
                        position="relative"
                        bg={isOpen ? "rgba(120,120,128,0.06)" : "transparent"}
                        _hover={{ bg: "rgba(120,120,128,0.04)" }}
                        _active={{ bg: "rgba(120,120,128,0.08)" }}
                        _expanded={{
                          bg: "rgba(120,120,128,0.06)",
                        }}
                        transition="background-color 0.15s ease"
                      >
                        {isOpen && (
                          <Box
                            position="absolute"
                            left={-2}
                            top={2}
                            bottom={2}
                            w="2px"
                            borderRadius="full"
                            bg={
                              confidenceLabel === "HIGH"
                                ? "rgba(52,199,89,0.9)"
                                : confidenceLabel === "MEDIUM"
                                ? "rgba(255,214,10,0.9)"
                                : "rgba(142,142,147,0.9)"
                            }
                          />
                        )}
                        <HStack justify="space-between" w="full" align="center" spacing={3}>
                          <HStack spacing={3} align="flex-start">
                            <Icon
                              as={getFieldIcon(fieldName)}
                              boxSize={5}
                              color={isOpen ? "#0A84FF" : "rgba(10,132,255,0.7)"}
                              opacity={isOpen ? 1 : 0.8}
                              transition="transform 0.18s ease, opacity 0.18s ease"
                              transform={isOpen && !prefersReducedMotion ? "scale(1.05)" : "scale(1)"}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500" fontSize="15px" color="#000">
                                {label}
                              </Text>
                              <Text fontSize="13px" color="#6E6E73" noOfLines={1}>
                                {valueText}
                              </Text>
                              {isOpen && (
                                <Box pt={2} w="full">
                                  <Box
                                    h="4px"
                                    bg="rgba(142,142,147,0.25)"
                                    borderRadius="full"
                                    overflow="hidden"
                                  >
                                    <Box
                                      h="100%"
                                      w={
                                        confidenceLabel === "HIGH"
                                          ? confidenceWidths.HIGH
                                          : confidenceLabel === "MEDIUM"
                                          ? confidenceWidths.MEDIUM
                                          : confidenceWidths.LOW
                                      }
                                      bg={
                                        confidenceLabel === "HIGH"
                                          ? "rgba(52,199,89,0.9)"
                                          : confidenceLabel === "MEDIUM"
                                          ? "rgba(255,214,10,0.9)"
                                          : "rgba(142,142,147,0.9)"
                                      }
                                      borderRadius="full"
                                      transition={prefersReducedMotion ? "none" : "width 0.2s ease"}
                                      position="relative"
                                    >
                                      <Box
                                        position="absolute"
                                        right="-3px"
                                        top="-2px"
                                        w="8px"
                                        h="8px"
                                        borderRadius="full"
                                        bg="white"
                                        border="2px solid rgba(0,0,0,0.08)"
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </VStack>
                          </HStack>
                          <HStack spacing={2} align="center">
                            {getConfidenceChip(fieldData.confidence)}
                            <AccordionIcon
                              transition={prefersReducedMotion ? "none" : "transform 0.18s ease"}
                              color="#6E6E73"
                              _groupHover={{ color: "#000" }}
                            />
                          </HStack>
                        </HStack>
                      </AccordionButton>

                      <AccordionPanel px={0} pt={1} pb={4}>
                        <Box
                          pl={6}
                          pr={1}
                          maxH="45vh"
                          overflowY="auto"
                          animation={
                            prefersReducedMotion
                              ? undefined
                              : `${fadeUp} 0.2s ease-out ${idx * 0.01}s`
                          }
                        >
                          <VStack align="stretch" spacing={2}>
                            <Text fontSize="13px" fontWeight="500" color="#000" letterSpacing="0.02em">
                              AI Rationale:
                            </Text>
                            <Text fontSize="13px" color="#6E6E73" lineHeight="1.6">
                              {fieldData.rationale}
                            </Text>
                            <HStack justify="flex-end" pt={1}>
                              {editingField === fieldName ? (
                                <HStack spacing={2}>
                                  {renderFieldEditor(fieldName, fieldData)}
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setEditingField(null)}
                                  >
                                    Cancel
                                  </Button>
                                </HStack>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  fontWeight="500"
                                  color="#0A84FF"
                                  onClick={() => setEditingField(fieldName)}
                                >
                                  Edit Value
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </Collapse>
          </Box>
        )}

        {/* Developer Settings - Shows MCP endpoints when profile is created */}
        {profileSlug && (
          <Box 
            mt={6}
            animation={prefersReducedMotion ? undefined : `${fadeUp} 0.35s ease-out 0.15s both`}
          >
            <DeveloperSettings investorSlug={profileSlug} />
          </Box>
        )}
        </Box>
        {/* End of main content Box */}

        {/* Fixed Footer - Hidden when main footer is visible (matching Step3 pattern) */}
        {!isFooterVisible && (
          <Box
            position="fixed"
            bottom={0}
            left="50%"
            transform="translateX(-50%)"
            zIndex={20}
            w="full"
            maxW="500px"
            bg="white"
            borderTop="1px solid"
            borderColor="#F1F5F9"
            p={6}
            boxShadow="0 -4px 20px rgba(0,0,0,0.03)"
            data-onboarding-footer
          >
            {/* CTA Button */}
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Generating..."
              w="full"
              h="56px"
              bg="#2b8cee"
              color="white"
              fontSize="16px"
              fontWeight="700"
              borderRadius="full"
              _hover={{ bg: "#2078d4" }}
              _active={{ transform: "scale(0.98)" }}
              _disabled={{ bg: "#E2E8F0", color: "#94A3B8" }}
              transition="all 0.2s ease"
            >
              {investorProfile ? "Update Profile" : "Generate Investor Profile"}
            </Button>

            {/* Footer Note */}
            <Text 
              mt={3} 
              fontSize="10px" 
              color="#94A3B8" 
              textAlign="center"
              letterSpacing="0.02em"
            >
              These details personalise your investor profile
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HushhUserProfilePage;
