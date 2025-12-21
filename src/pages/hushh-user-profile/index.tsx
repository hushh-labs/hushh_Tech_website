import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast, useClipboard } from "@chakra-ui/react";
import { useFooterVisibility } from "../../utils/useFooterVisibility";
import { ArrowLeft, User, TrendingUp, Shield, ChevronDown, Calendar, Brain, Target, Clock, Gauge, Droplets, Briefcase, Layers, Zap, Activity, ChevronUp, Edit2, Share2, Link, Copy, Check, ExternalLink } from "lucide-react";
import { FaApple, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiGooglepay } from "react-icons/si";
import { HiMail } from "react-icons/hi";
import resources from "../../resources/resources";
import { generateInvestorProfile } from "../../services/investorProfile/apiClient";
import { downloadHushhGoldPass, launchGoogleWalletPass } from "../../services/walletPass";
import { InvestorProfile, FIELD_LABELS, VALUE_LABELS } from "../../types/investorProfile";

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
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  initialInvestmentAmount: number | "";
}

const defaultFormState: FormState = {
  name: "",
  email: "",
  age: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  organisation: "",
  accountType: "",
  selectedFund: "",
  referralSource: "",
  citizenshipCountry: "",
  residenceCountry: "",
  accountStructure: "",
  legalFirstName: "",
  legalLastName: "",
  addressLine1: "",
  city: "",
  state: "",
  zipCode: "",
  dateOfBirth: "",
  initialInvestmentAmount: "",
};

const HushhUserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isFooterVisible = useFooterVisibility();
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [userId, setUserId] = useState<string | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const [isApplePassLoading, setIsApplePassLoading] = useState(false);
  const [isGooglePassLoading, setIsGooglePassLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Field options for AI-generated profile editing
  const FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
    primary_goal: [
      { value: "capital_preservation", label: "Capital Preservation" },
      { value: "steady_income", label: "Steady Income" },
      { value: "long_term_growth", label: "Long-term Growth" },
      { value: "aggressive_growth", label: "Aggressive Growth" },
      { value: "speculation", label: "Speculation" },
    ],
    investment_horizon_years: [
      { value: "<3_years", label: "Less than 3 years" },
      { value: "3_5_years", label: "3-5 years" },
      { value: "5_10_years", label: "5-10 years" },
      { value: ">10_years", label: "More than 10 years" },
    ],
    risk_tolerance: [
      { value: "very_low", label: "Very Low" },
      { value: "low", label: "Low" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High" },
      { value: "very_high", label: "Very High" },
    ],
    liquidity_need: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    experience_level: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
    typical_ticket_size: [
      { value: "micro_<1m", label: "Micro (< $1 million)" },
      { value: "small_1m_10m", label: "Small ($1M - $10M)" },
      { value: "medium_10m_50m", label: "Medium ($10M - $50M)" },
      { value: "large_>50m", label: "Large (> $50 million)" },
    ],
    annual_investing_capacity: [
      { value: "<5m", label: "< $5 million" },
      { value: "5m_20m", label: "$5M - $20M" },
      { value: "20m_100m", label: "$20M - $100M" },
      { value: ">100m", label: "> $100 million" },
    ],
    asset_class_preference: [
      { value: "public_equities", label: "Public Equities" },
      { value: "mutual_funds_etfs", label: "Mutual Funds / ETFs" },
      { value: "fixed_income", label: "Fixed Income" },
      { value: "real_estate", label: "Real Estate" },
      { value: "startups_private_equity", label: "Startups / Private Equity" },
      { value: "crypto_digital_assets", label: "Crypto / Digital Assets" },
      { value: "cash_equivalents", label: "Cash Equivalents" },
    ],
    sector_preferences: [
      { value: "technology", label: "Technology" },
      { value: "consumer_internet", label: "Consumer Internet" },
      { value: "fintech", label: "Fintech" },
      { value: "healthcare", label: "Healthcare" },
      { value: "real_estate", label: "Real Estate" },
      { value: "energy_climate", label: "Energy & Climate" },
      { value: "industrial", label: "Industrial" },
      { value: "other", label: "Other" },
    ],
    volatility_reaction: [
      { value: "sell_to_avoid_more_loss", label: "Sell to Avoid More Loss" },
      { value: "hold_and_wait", label: "Hold and Wait" },
      { value: "buy_more_at_lower_prices", label: "Buy More at Lower Prices" },
    ],
    sustainability_preference: [
      { value: "not_important", label: "Not Important" },
      { value: "nice_to_have", label: "Nice to Have" },
      { value: "important", label: "Important" },
      { value: "very_important", label: "Very Important" },
    ],
    engagement_style: [
      { value: "very_passive_just_updates", label: "Very Passive (Just Updates)" },
      { value: "collaborative_discuss_key_decisions", label: "Collaborative (Discuss Key Decisions)" },
      { value: "hands_on_active_trader", label: "Hands-on (Active Trader)" },
    ],
  };

  // Multi-select fields
  const MULTI_SELECT_FIELDS = ["asset_class_preference", "sector_preferences"];

  // Handle updating an AI profile field
  const handleUpdateAIField = (fieldName: string, newValue: string | string[]) => {
    if (!investorProfile) return;
    
    setInvestorProfile({
      ...investorProfile,
      [fieldName]: {
        ...investorProfile[fieldName as keyof InvestorProfile],
        value: newValue,
      },
    });
    setEditingField(null);
  };

  // Handle multi-select toggle
  const handleMultiSelectToggle = (fieldName: string, optionValue: string) => {
    if (!investorProfile) return;
    
    const fieldData = investorProfile[fieldName as keyof InvestorProfile];
    const currentValues = fieldData?.value || [];
    const currentArray: string[] = Array.isArray(currentValues) 
      ? (currentValues as string[]) 
      : [currentValues as string];
    
    let newValues: string[];
    if (currentArray.includes(optionValue)) {
      newValues = currentArray.filter((v) => v !== optionValue);
    } else {
      newValues = [...currentArray, optionValue];
    }
    
    setInvestorProfile({
      ...investorProfile,
      [fieldName]: {
        ...investorProfile[fieldName as keyof InvestorProfile],
        value: newValues,
      },
    });
  };

  // Profile URL for sharing
  const profileUrl = profileSlug ? `https://hushhtech.com/investor/${profileSlug}` : "";
  const { hasCopied, onCopy } = useClipboard(profileUrl);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = resources.config.supabaseClient;
        if (!supabase) return;

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

        // Load existing investor profile
        const { data: existingProfile } = await supabase
          .from("investor_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (existingProfile) {
          // Always load the slug if it exists (regardless of investor_profile)
          if (existingProfile.slug) {
            setProfileSlug(existingProfile.slug);
          }
          
          // Load AI-generated profile if available
          if (existingProfile.investor_profile) {
            setInvestorProfile(existingProfile.investor_profile);
          }
          
          // Prefill form from investor_profiles table
          setForm((prev) => ({
            ...prev,
            name: existingProfile.name || fullName,
            email: existingProfile.email || user.email || "",
            age: existingProfile.age || "",
            phoneCountryCode: existingProfile.phone_country_code || "+1",
            phoneNumber: existingProfile.phone_number || "",
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
          // Mark that user has completed onboarding
          setHasOnboardingData(true);
          
          const calculatedAge = onboardingData.date_of_birth
            ? new Date().getFullYear() - new Date(onboardingData.date_of_birth).getFullYear()
            : "";

          // Build name from onboarding data
          const onboardingName = onboardingData.legal_first_name && onboardingData.legal_last_name
            ? `${onboardingData.legal_first_name} ${onboardingData.legal_last_name}`
            : fullName;

          setForm((prev) => ({
            ...prev,
            name: onboardingName || prev.name,
            age: calculatedAge || prev.age,
            // Pre-fill phone number from onboarding (Step 8)
            phoneCountryCode: onboardingData.phone_country_code || prev.phoneCountryCode,
            phoneNumber: onboardingData.phone_number || prev.phoneNumber,
            accountType: onboardingData.account_type || "",
            selectedFund: onboardingData.selected_fund || "",
            referralSource: onboardingData.referral_source || "",
            citizenshipCountry: onboardingData.citizenship_country || "",
            residenceCountry: onboardingData.residence_country || "",
            accountStructure: onboardingData.account_structure || "",
            legalFirstName: onboardingData.legal_first_name || "",
            legalLastName: onboardingData.legal_last_name || "",
            addressLine1: onboardingData.address_line_1 || "",
            city: onboardingData.city || "",
            state: onboardingData.state || "",
            zipCode: onboardingData.zip_code || "",
            dateOfBirth: onboardingData.date_of_birth || "",
            initialInvestmentAmount: onboardingData.initial_investment_amount || "",
          }));

          // Auto-create investor_profiles row if user completed onboarding but doesn't have one
          // This triggers the PostgreSQL slug generation trigger
          if (onboardingData.is_completed && !existingProfile) {
            const userName = onboardingName || user.email?.split('@')[0] || 'Investor';
            const userAge = typeof calculatedAge === 'number' ? calculatedAge : 30;
            
            const { data: newProfile } = await supabase
              .from("investor_profiles")
              .upsert({
                user_id: user.id,
                name: userName,
                email: user.email || "",
                age: userAge,
                phone_country_code: onboardingData.phone_country_code || "+1",
                phone_number: onboardingData.phone_number || "",
                organisation: null,
                investor_profile: null, // No AI profile yet, just basic row for slug
                user_confirmed: false,
              })
              .select("slug")
              .single();

            // Set the slug immediately if created
            if (newProfile?.slug) {
              setProfileSlug(newProfile.slug);
            }
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (key: keyof FormState, value: string) => {
    if (key === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 15) return;
    }
    setForm((prev) => ({ ...prev, [key]: key === "age" || key === "initialInvestmentAmount" ? Number(value) || "" : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only name, email, and age are required - phone is pre-filled from onboarding and optional here
    if (!form.name || !form.email || form.age === "") {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (Name, Email, Age)",
        status: "warning",
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
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

      if (userId) {
        const supabase = resources.config.supabaseClient;
        if (supabase) {
          const { data: upsertData } = await supabase
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
            .select("slug")
            .single();

          // Set profile slug if returned
          if (upsertData?.slug) {
            setProfileSlug(upsertData.slug);
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

  const handleBack = () => {
    // More robust history check - use browser's history length
    // which is more reliable than React Router's internal state
    if (window.history.length > 2) {
      // There's navigation history, go back
      navigate(-1);
    } else {
      // No meaningful history (only current page or direct access), go to home
      navigate('/');
    }
  };

  const handleSave = () => {
    // Trigger form submit
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  };

  // Handle Apple Wallet pass download
  const handleAppleWalletPass = async () => {
    if (!form.name) {
      toast({
        title: "Name required",
        description: "Please enter your name to generate a wallet pass",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsApplePassLoading(true);
    try {
      await downloadHushhGoldPass({
        name: form.name,
        email: form.email || null,
        organisation: form.organisation || null,
        slug: profileSlug,
        userId,
        investmentAmount: typeof form.initialInvestmentAmount === "number" ? form.initialInvestmentAmount : null,
      });
      toast({
        title: "Pass Downloaded",
        description: "Your Apple Wallet pass has been downloaded",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Apple Wallet pass",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsApplePassLoading(false);
    }
  };

  // Handle Google Wallet pass
  const handleGoogleWalletPass = async () => {
    if (!form.name) {
      toast({
        title: "Name required",
        description: "Please enter your name to generate a wallet pass",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsGooglePassLoading(true);
    try {
      await launchGoogleWalletPass({
        name: form.name,
        email: form.email || null,
        organisation: form.organisation || null,
        slug: profileSlug,
        userId,
        investmentAmount: typeof form.initialInvestmentAmount === "number" ? form.initialInvestmentAmount : null,
      });
      toast({
        title: "Google Wallet",
        description: "Redirecting to Google Wallet...",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Google Wallet pass",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsGooglePassLoading(false);
    }
  };

  // Social share handlers
  const handleShareWhatsApp = () => {
    if (!profileUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my Hushh investor profile: ${profileUrl}`)}`, '_blank');
  };

  const handleShareX = () => {
    if (!profileUrl) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my Hushh investor profile: ${profileUrl}`)}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!profileUrl) return;
    window.location.href = `mailto:?subject=${encodeURIComponent('My Hushh Investor Profile')}&body=${encodeURIComponent(`Check out my investor profile: ${profileUrl}`)}`;
  };

  const handleShareLinkedIn = () => {
    if (!profileUrl) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const handleOpenProfile = () => {
    if (!profileUrl) return;
    window.open(profileUrl, '_blank');
  };

  // Input styles matching the HTML design
  const inputClassName = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:ring-2 focus:ring-[#2B8CEE] focus:border-[#2B8CEE] outline-none transition-shadow placeholder-gray-400";
  const selectClassName = "w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] focus:ring-2 focus:ring-[#2B8CEE] focus:border-[#2B8CEE] outline-none appearance-none pr-10";
  const labelClassName = "block text-sm font-medium text-[#111827] mb-1.5";

  return (
    <div 
      className="bg-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Main Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-8">
        
        {/* Sticky Header */}
        <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white z-10 border-b border-transparent">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 text-[#111827] hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-[#111827]">Investor Profile</h1>
          <button 
            onClick={handleSave}
            className="text-[#2B8CEE] font-semibold text-base px-2 py-1 hover:bg-blue-50 rounded transition-colors"
          >
            Save
          </button>
        </header>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="flex-1 px-4 py-2 space-y-6 pb-40">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="h-32 w-full relative bg-gradient-to-br from-slate-800 to-blue-900">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-blue-900/90" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#2B8CEE] text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide uppercase shadow-sm">
                  Premium Member
                </span>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 text-[#111827]">
                Welcome back, {form.name?.split(' ')[0] || 'Alex'}
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Complete your profile to unlock personalized investment insights tailored to your financial goals.
              </p>
            </div>
          </div>

          {/* Your Investor Profile - Share Section */}
          {profileSlug && (
            <section className="bg-[#2B8CEE] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Your Investor Profile</h3>
                </div>
                <button
                  onClick={handleOpenProfile}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  aria-label="Open profile"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Share this link to let others view your profile
              </p>

              {/* Profile URL Display */}
              <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-4">
                <Link className="w-5 h-5 text-[#2B8CEE] flex-shrink-0" />
                <span className="text-sm text-[#374151] truncate flex-1">
                  {profileUrl}
                </span>
                <button
                  onClick={onCopy}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Copy link"
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Share via Social */}
              <p className="text-sm text-white/90 mb-3">Share via</p>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleShareX}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Share on X"
                >
                  <FaXTwitter className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleShareEmail}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Share via Email"
                >
                  <HiMail className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={onCopy}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Copy link"
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Wallet Pass Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAppleWalletPass}
                  disabled={isApplePassLoading}
                  className="w-full bg-white hover:bg-gray-50 text-[#111827] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  <FaApple className="w-5 h-5" />
                  {isApplePassLoading ? "Generating..." : "Add to Apple Wallet"}
                </button>
                <button
                  onClick={handleGoogleWalletPass}
                  disabled={isGooglePassLoading}
                  className="w-full bg-white hover:bg-gray-50 text-[#111827] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#E5E7EB] disabled:opacity-70"
                >
                  <SiGooglepay className="w-5 h-5" />
                  {isGooglePassLoading ? "Generating..." : "Add to Google Wallet"}
                </button>
              </div>
            </section>
          )}

          {/* Section Title */}
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Your Hushh Profile</h2>
            <div className="h-px w-full bg-[#E5E7EB] mt-4" />
          </div>

          {/* Personal Information Section */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <User className="w-6 h-6 text-[#2B8CEE]" />
              <h3 className="text-lg font-semibold text-[#111827]">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>
                  Full Name <span className="text-[#2B8CEE]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  Email <span className="text-[#2B8CEE]">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="alex@example.com"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>
                  Age <span className="text-[#2B8CEE]">*</span>
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="e.g. 34"
                  className={inputClassName}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={labelClassName}>Code</label>
                  <div className="relative">
                    <select 
                      value={form.phoneCountryCode}
                      onChange={(e) => handleChange("phoneCountryCode", e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:ring-2 focus:ring-[#2B8CEE] focus:border-[#2B8CEE] outline-none appearance-none pr-8"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelClassName}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Pre-filled from onboarding"
                    className={inputClassName}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Organisation (Optional)</label>
                <input
                  type="text"
                  value={form.organisation}
                  onChange={(e) => handleChange("organisation", e.target.value)}
                  placeholder="Company Name"
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {/* Investment Profile Section */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-6 h-6 text-[#2B8CEE]" />
              <h3 className="text-lg font-semibold text-[#111827]">Investment Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Account Type</label>
                <div className="relative">
                  <select 
                    value={form.accountType}
                    onChange={(e) => handleChange("accountType", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select account type</option>
                    <option value="individual">Individual</option>
                    <option value="joint">Joint</option>
                    <option value="retirement">Retirement (IRA)</option>
                    <option value="trust">Trust</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Account Structure</label>
                <div className="relative">
                  <select 
                    value={form.accountStructure}
                    onChange={(e) => handleChange("accountStructure", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select structure</option>
                    <option value="discretionary">Discretionary</option>
                    <option value="non-discretionary">Non-Discretionary</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Selected Fund</label>
                <div className="relative">
                  <select 
                    value={form.selectedFund}
                    onChange={(e) => handleChange("selectedFund", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Choose a fund</option>
                    <option value="hushh_fund_a">Hushh Growth Fund A</option>
                    <option value="hushh_fund_b">Hushh Balanced Fund B</option>
                    <option value="hushh_fund_c">Hushh Secure Yield C</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Initial Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
                  <input
                    type="number"
                    value={form.initialInvestmentAmount}
                    onChange={(e) => handleChange("initialInvestmentAmount", e.target.value)}
                    placeholder="0.00"
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Referral Source</label>
                <div className="relative">
                  <select 
                    value={form.referralSource}
                    onChange={(e) => handleChange("referralSource", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>How did you hear about us?</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_family">Friend/Family</option>
                    <option value="financial_advisor">Financial Advisor</option>
                    <option value="news_article">News Article</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Legal & Residential Section */}
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="w-6 h-6 text-[#2B8CEE]" />
              <h3 className="text-lg font-semibold text-[#111827]">Legal &amp; Residential</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>Legal First Name</label>
                  <input
                    type="text"
                    value={form.legalFirstName}
                    onChange={(e) => handleChange("legalFirstName", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Legal Last Name</label>
                  <input
                    type="text"
                    value={form.legalLastName}
                    onChange={(e) => handleChange("legalLastName", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className={inputClassName}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Citizenship Country</label>
                <div className="relative">
                  <select 
                    value={form.citizenshipCountry}
                    onChange={(e) => handleChange("citizenshipCountry", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Residence Country</label>
                <div className="relative">
                  <select 
                    value={form.residenceCountry}
                    onChange={(e) => handleChange("residenceCountry", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="" disabled>Select country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClassName}>Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="Street address"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Zip Code</label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* AI Generated Investor Profile Section */}
          {investorProfile && (
            <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-[#2B8CEE]" />
                  <h3 className="text-lg font-semibold text-[#111827]">AI-Generated Investor Profile</h3>
                </div>
                <button
                  onClick={() => navigate('/investor-profile')}
                  className="flex items-center gap-1.5 text-[#2B8CEE] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  aria-label="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                Based on your information, our AI has analyzed your investment preferences:
              </p>
              <div className="space-y-3">
                {Object.entries(investorProfile).map(([fieldName, fieldData]: [string, any]) => {
                  const label = FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
                  const valueText = Array.isArray(fieldData.value)
                    ? fieldData.value.map((v: string) => VALUE_LABELS[v as keyof typeof VALUE_LABELS] || v).join(", ")
                    : VALUE_LABELS[fieldData.value as keyof typeof VALUE_LABELS] || fieldData.value;
                  const confidence = fieldData.confidence || 0;
                  const confidenceLabel = confidence >= 0.7 ? "High" : confidence >= 0.4 ? "Medium" : "Low";
                  const confidenceColor = confidence >= 0.7 ? "#22C55E" : confidence >= 0.4 ? "#F59E0B" : "#9CA3AF";
                  const confidenceWidth = `${Math.round(confidence * 100)}%`;
                  const isEditing = editingField === fieldName;
                  const isMultiSelect = MULTI_SELECT_FIELDS.includes(fieldName);
                  const fieldOptions = FIELD_OPTIONS[fieldName] || [];

                  // Get icon based on field name
                  const getIcon = () => {
                    switch (fieldName) {
                      case "primary_goal": return <Target className="w-5 h-5 text-[#2B8CEE]" />;
                      case "investment_horizon_years": return <Clock className="w-5 h-5 text-[#2B8CEE]" />;
                      case "risk_tolerance": return <Gauge className="w-5 h-5 text-[#2B8CEE]" />;
                      case "liquidity_need": return <Droplets className="w-5 h-5 text-[#2B8CEE]" />;
                      case "experience_level": return <Briefcase className="w-5 h-5 text-[#2B8CEE]" />;
                      case "asset_class_preference": return <Layers className="w-5 h-5 text-[#2B8CEE]" />;
                      case "typical_ticket_size": return <Zap className="w-5 h-5 text-[#2B8CEE]" />;
                      case "engagement_style": return <Activity className="w-5 h-5 text-[#2B8CEE]" />;
                      default: return <TrendingUp className="w-5 h-5 text-[#2B8CEE]" />;
                    }
                  };

                  // Get current values as array for multi-select
                  const currentValues: string[] = Array.isArray(fieldData.value) 
                    ? fieldData.value 
                    : [fieldData.value];

                  return (
                    <div 
                      key={fieldName}
                      className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]"
                    >
                      <div className="flex items-start gap-3">
                        {getIcon()}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#111827]">{label}</span>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${confidenceColor}15`,
                                  color: confidenceColor 
                                }}
                              >
                                {confidenceLabel}
                              </span>
                              {!isEditing && (
                                <button
                                  onClick={() => setEditingField(fieldName)}
                                  className="p-1 text-[#6B7280] hover:text-[#2B8CEE] hover:bg-blue-50 rounded transition-colors"
                                  aria-label={`Edit ${label}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Edit Mode */}
                          {isEditing ? (
                            <div className="mt-2">
                              {isMultiSelect ? (
                                // Multi-select checkboxes
                                <div className="space-y-2">
                                  {fieldOptions.map((option) => (
                                    <label 
                                      key={option.value}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={currentValues.includes(option.value)}
                                        onChange={() => handleMultiSelectToggle(fieldName, option.value)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#2B8CEE] focus:ring-[#2B8CEE]"
                                      />
                                      <span className="text-sm text-[#374151]">{option.label}</span>
                                    </label>
                                  ))}
                                  <button
                                    onClick={() => setEditingField(null)}
                                    className="mt-2 px-3 py-1.5 bg-[#2B8CEE] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                  >
                                    Done
                                  </button>
                                </div>
                              ) : (
                                // Single-select dropdown
                                <div className="space-y-2">
                                  <div className="relative">
                                    <select
                                      value={fieldData.value}
                                      onChange={(e) => handleUpdateAIField(fieldName, e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] text-sm focus:ring-2 focus:ring-[#2B8CEE] focus:border-[#2B8CEE] outline-none appearance-none pr-8"
                                    >
                                      {fieldOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                  </div>
                                  <button
                                    onClick={() => setEditingField(null)}
                                    className="px-3 py-1.5 text-[#6B7280] text-sm font-medium hover:text-[#111827] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Display Mode
                            <>
                              <p className="text-sm text-[#374151] mb-2">{valueText}</p>
                              
                              {/* Confidence bar */}
                              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: confidenceWidth,
                                    backgroundColor: confidenceColor 
                                  }}
                                />
                              </div>
                              
                              {/* AI Rationale */}
                              {fieldData.rationale && (
                                <p className="text-xs text-[#6B7280] mt-2 italic">
                                  💡 {fieldData.rationale}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </form>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div 
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-md bg-white border-t border-[#E5E7EB] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
            data-onboarding-footer
          >
            <button
              type="submit"
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#2B8CEE] hover:bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? "Generating..." 
                : investorProfile 
                  ? "Update Profile" 
                  : hasOnboardingData 
                    ? "Enhance with AI" 
                    : "Generate Investor Profile"
              }
            </button>
            <p className="text-xs text-[#6B7280] text-center mt-4 leading-normal px-2">
              {investorProfile 
                ? "Update your AI-generated investor profile."
                : hasOnboardingData
                  ? "Generate an AI-powered profile from your data."
                  : "These details personalise your investor profile."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HushhUserProfilePage;
