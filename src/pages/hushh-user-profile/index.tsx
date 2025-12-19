import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useFooterVisibility } from "../../utils/useFooterVisibility";
import { ArrowLeft, User, TrendingUp, Shield, ChevronDown, Calendar } from "lucide-react";
import resources from "../../resources/resources";
import { generateInvestorProfile } from "../../services/investorProfile/apiClient";
import { InvestorProfile } from "../../types/investorProfile";

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
  const [loading, setLoading] = useState(false);

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

        if (existingProfile && existingProfile.investor_profile) {
          setInvestorProfile(existingProfile.investor_profile);
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
          const calculatedAge = onboardingData.date_of_birth
            ? new Date().getFullYear() - new Date(onboardingData.date_of_birth).getFullYear()
            : "";

          setForm((prev) => ({
            ...prev,
            age: calculatedAge || prev.age,
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
          await supabase
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
            });
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
    navigate(-1);
  };

  const handleSave = () => {
    // Trigger form submit
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
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
                  <label className={labelClassName}>
                    Code <span className="text-[#2B8CEE]">*</span>
                  </label>
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
                  <label className={labelClassName}>
                    Phone Number <span className="text-[#2B8CEE]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="(555) 000-0000"
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
              {loading ? "Generating..." : (investorProfile ? "Update Profile" : "Generate Investor Profile")}
            </button>
            <p className="text-xs text-[#6B7280] text-center mt-4 leading-normal px-2">
              These details personalise your investor profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HushhUserProfilePage;
