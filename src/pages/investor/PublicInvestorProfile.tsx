import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useToast, useClipboard, Spinner } from "@chakra-ui/react";
import { 
  ArrowLeft, Share2, Link, Copy, Check, ExternalLink, 
  Home, MessageCircle, Code, User, TrendingUp, 
  Target, Clock, Gauge, Droplets, Briefcase, Layers, Zap, Activity,
  Brain, ChevronDown, ChevronUp
} from "lucide-react";
import { FaApple, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiGooglepay } from "react-icons/si";
import { HiMail } from "react-icons/hi";
import { InvestorChatWidget } from "../../components/InvestorChatWidget";
import DeveloperSettings from "../../components/DeveloperSettings";
import { fetchPublicInvestorProfileBySlug } from "../../services/investorProfile";
import { maskProfileData, maskOnboardingField } from "../../utils/maskSensitiveData";
import { InvestorProfile, FIELD_LABELS, VALUE_LABELS, ONBOARDING_FIELD_LABELS } from "../../types/investorProfile";
import { OnboardingData } from "../../types/onboarding";

type TabType = 'home' | 'chat' | 'developer';

const PublicInvestorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle tab change with scroll to top
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Scroll to top of viewport
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const profileUrl = `https://hushhtech.com/investor/${slug}`;
  const { hasCopied, onCopy } = useClipboard(profileUrl);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      try {
        const data = await fetchPublicInvestorProfileBySlug(slug);
        setProfileData(data);
        
        // Send profile view notification email via Vercel API (async, don't wait)
        fetch('/api/send-email-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'profile_view',
            slug,
            profileOwnerEmail: data.email,
            profileName: data.name
          })
        }).catch(err => console.log('Email notification failed:', err));
        
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Profile Not Found",
          description: "This investor profile doesn't exist or is private",
          status: "error",
          duration: 5000,
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug, navigate, toast]);

  // Toggle field expansion
  const toggleField = (fieldName: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  // Social share handlers
  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this investor profile: ${profileUrl}`)}`, '_blank');
  };

  const handleShareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this investor profile: ${profileUrl}`)}`, '_blank');
  };

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('Investor Profile')}&body=${encodeURIComponent(`Check out this investor profile: ${profileUrl}`)}`;
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const handleOpenProfile = () => {
    window.open(profileUrl, '_blank');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Get OG image URL
  const ogImageUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investor-og-image?slug=${slug}`;

  // Get confidence chip styling
  const getConfidenceChip = (confidence: number) => {
    const label = confidence >= 0.7 ? "High" : confidence >= 0.4 ? "Medium" : "Low";
    const color = confidence >= 0.7 ? "#22C55E" : confidence >= 0.4 ? "#F59E0B" : "#9CA3AF";
    return { label, color };
  };

  // Get icon based on field name
  const getFieldIcon = (fieldName: string) => {
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

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" color="#2B8CEE" thickness="4px" />
          <p className="text-[#6B7280] mt-4">Loading investor profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const maskedData = maskProfileData(profileData);
  const investorProfile: InvestorProfile = profileData.investor_profile;
  const onboardingData: OnboardingData | null = profileData.onboarding_data;
  const privacySettings = profileData.privacy_settings || {};

  // Helper function to check if a field should be displayed
  const isFieldVisible = (section: 'investor_profile' | 'onboarding_data', fieldName: string): boolean => {
    if (!privacySettings[section]) return true;
    return privacySettings[section][fieldName] !== false;
  };

  // Filter and format onboarding data for display
  const getVisibleOnboardingFields = () => {
    if (!onboardingData) return [];
    
    const fields: Array<{key: string, label: string, value: any, category: string}> = [];
    
    if (onboardingData.account_type && isFieldVisible('onboarding_data', 'account_type')) {
      fields.push({ key: 'account_type', label: ONBOARDING_FIELD_LABELS.account_type, value: maskOnboardingField('account_type', VALUE_LABELS[onboardingData.account_type] || onboardingData.account_type), category: 'Basic Information' });
    }
    if (onboardingData.selected_fund && isFieldVisible('onboarding_data', 'selected_fund')) {
      fields.push({ key: 'selected_fund', label: ONBOARDING_FIELD_LABELS.selected_fund, value: maskOnboardingField('selected_fund', onboardingData.selected_fund), category: 'Basic Information' });
    }
    if (onboardingData.citizenship_country && isFieldVisible('onboarding_data', 'citizenship_country')) {
      fields.push({ key: 'citizenship_country', label: ONBOARDING_FIELD_LABELS.citizenship_country, value: maskOnboardingField('citizenship_country', onboardingData.citizenship_country), category: 'Location' });
    }
    if (onboardingData.residence_country && isFieldVisible('onboarding_data', 'residence_country')) {
      fields.push({ key: 'residence_country', label: ONBOARDING_FIELD_LABELS.residence_country, value: maskOnboardingField('residence_country', onboardingData.residence_country), category: 'Location' });
    }
    
    return fields;
  };

  const visibleOnboardingFields = getVisibleOnboardingFields();

  return (
    <>
      <Helmet>
        <title>{`${maskedData.name}'s Investor Profile | Hushh`}</title>
        <meta name="description" content={`View ${maskedData.name}'s verified investor profile. ${maskedData.organisation ? `Works at ${maskedData.organisation}` : ''}`} />
        <meta property="og:title" content={`${maskedData.name} - Investor Profile`} />
        <meta property="og:description" content={`Verified investor on Hushh. Age ${maskedData.age}${maskedData.organisation ? ` • ${maskedData.organisation}` : ''}`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${maskedData.name} - Investor Profile`} />
        <meta name="twitter:description" content={`Verified investor on Hushh`} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div 
        className="bg-white min-h-screen"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-24">

          {/* Main Content Area */}
          <div className="flex-1 px-4 py-4 space-y-6">
            
            {/* HOME TAB CONTENT */}
            {activeTab === 'home' && (
              <>
                {/* Welcome Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                  <div className="h-28 w-full relative bg-gradient-to-br from-slate-800 to-blue-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-blue-900/90" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#2B8CEE] text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wide uppercase shadow-sm">
                        🏆 Verified Investor
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-2 text-[#111827]">
                      Hello, {maskedData.name?.split(' ')[0] || 'Investor'}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1.5 bg-[#F3F4F6] rounded-full text-xs font-medium text-[#6B7280]">
                        Age {maskedData.age}
                      </span>
                      <span className="px-3 py-1.5 bg-[#F3F4F6] rounded-full text-xs font-medium text-[#6B7280]">
                        {maskedData.email}
                      </span>
                      {maskedData.organisation && (
                        <span className="px-3 py-1.5 bg-[#F3F4F6] rounded-full text-xs font-medium text-[#6B7280]">
                          {maskedData.organisation}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      Contact details are masked for privacy.
                    </p>
                  </div>
                </div>

                {/* Share Section */}
                <section className="bg-[#2B8CEE] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-white" />
                      <h3 className="text-lg font-semibold text-white">{maskedData.name}'s Profile</h3>
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
                    Share this profile with others
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
                      className="w-full bg-white hover:bg-gray-50 text-[#111827] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaApple className="w-5 h-5" />
                      Add to Apple Wallet
                    </button>
                    <button
                      className="w-full bg-white hover:bg-gray-50 text-[#111827] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#E5E7EB]"
                    >
                      <SiGooglepay className="w-5 h-5" />
                      Add to Google Wallet
                    </button>
                  </div>
                </section>

                {/* AI Generated Investment Profile */}
                {investorProfile && (
                  <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <Brain className="w-6 h-6 text-[#2B8CEE]" />
                      <h3 className="text-lg font-semibold text-[#111827]">Investment Profile</h3>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-4">
                      AI-analyzed investment preferences and insights
                    </p>
                    <div className="space-y-3">
                      {Object.entries(investorProfile).map(([fieldName, fieldData]: [string, any]) => {
                        const label = FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
                        const valueText = Array.isArray(fieldData.value)
                          ? fieldData.value.map((v: string) => VALUE_LABELS[v as keyof typeof VALUE_LABELS] || v).join(", ")
                          : VALUE_LABELS[fieldData.value as keyof typeof VALUE_LABELS] || fieldData.value;
                        const { label: confLabel, color: confColor } = getConfidenceChip(fieldData.confidence || 0);
                        const isExpanded = expandedFields.has(fieldName);

                        return (
                          <div 
                            key={fieldName}
                            className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]"
                          >
                            <button
                              onClick={() => toggleField(fieldName)}
                              className="w-full flex items-start gap-3 text-left"
                            >
                              {getFieldIcon(fieldName)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-[#111827]">{label}</span>
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                                      style={{ 
                                        backgroundColor: `${confColor}15`,
                                        color: confColor 
                                      }}
                                    >
                                      {confLabel}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-[#374151]">{valueText}</p>
                              </div>
                            </button>
                            
                            {/* Expanded content with rationale */}
                            {isExpanded && fieldData.rationale && (
                              <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280] italic">
                                  💡 {fieldData.rationale}
                                </p>
                                {/* Confidence bar */}
                                <div className="mt-2 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${Math.round((fieldData.confidence || 0) * 100)}%`,
                                      backgroundColor: confColor 
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Personal Information */}
                {visibleOnboardingFields.length > 0 && (
                  <section className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <User className="w-6 h-6 text-[#2B8CEE]" />
                      <h3 className="text-lg font-semibold text-[#111827]">Personal Information</h3>
                    </div>
                    <div className="space-y-3">
                      {visibleOnboardingFields.map((field) => (
                        <div 
                          key={field.key}
                          className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-b-0"
                        >
                          <span className="text-sm text-[#6B7280]">{field.label}</span>
                          <span className="text-sm font-medium text-[#111827]">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* CTA to create own profile */}
                <section className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-5">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">
                      Want your own investor profile?
                    </h3>
                    <p className="text-sm text-[#6B7280] mb-4">
                      Create your AI-powered investor profile in minutes
                    </p>
                    <button
                      onClick={() => navigate("/investor-profile")}
                      className="w-full bg-[#2B8CEE] hover:bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all duration-200"
                    >
                      Create Your Hushh ID →
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* CHAT TAB CONTENT */}
            {activeTab === 'chat' && (
              <div className="flex-1">
                <InvestorChatWidget slug={slug!} investorName={maskedData.name} />
              </div>
            )}

            {/* DEVELOPER TAB CONTENT */}
            {activeTab === 'developer' && (
              <div className="flex-1">
                <DeveloperSettings investorSlug={slug!} />
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar - Black */}
          <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-20">
            <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4 safe-bottom">
              <button
                onClick={() => handleTabChange('home')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'home' 
                    ? 'text-[#2B8CEE]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Home</span>
              </button>
              <button
                onClick={() => handleTabChange('chat')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-[#2B8CEE]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Chat</span>
              </button>
              <button
                onClick={() => handleTabChange('developer')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'developer' 
                    ? 'text-[#2B8CEE]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Code className="w-5 h-5" />
                <span className="text-xs font-medium">Developer</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default PublicInvestorProfilePage;
