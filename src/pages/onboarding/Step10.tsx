import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Types for location data from our Edge Function
interface Country {
  isoCode: string;
  name: string;
}

interface State {
  isoCode: string;
  name: string;
}

interface City {
  name: string;
}

// Supabase Edge Function URL
const LOCATIONS_API = 'https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/get-locations';

// Back arrow icon
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
// Help icon
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Info icon for helper text
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 flex-shrink-0 mt-0.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// Chevron down icon for selects
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// Field validation errors type
interface FieldErrors {
  addressLine1?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

function OnboardingStep10() {
  const navigate = useNavigate();
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [country, setCountry] = useState('US'); // ISO code
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isFooterVisible = useFooterVisibility();

  // Location data from Edge Function
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingLocations(true);
        const response = await fetch(`${LOCATIONS_API}?type=countries`);
        const result = await response.json();
        if (result.data) {
          setCountries(result.data);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!country) {
      setStates([]);
      return;
    }

    const fetchStates = async () => {
      try {
        setLoadingLocations(true);
        const response = await fetch(`${LOCATIONS_API}?type=states&country=${country}`);
        const result = await response.json();
        if (result.data) {
          setStates(result.data);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchStates();
  }, [country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        setLoadingLocations(true);
        const response = await fetch(`${LOCATIONS_API}?type=cities&country=${country}&state=${state}`);
        const result = await response.json();
        if (result.data) {
          setCities(result.data);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchCities();
  }, [country, state]);

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('address_line_1, address_line_2, address_country, state, city, zip_code')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAddressLine1(data.address_line_1 || '');
        setAddressLine2(data.address_line_2 || '');
        setCountry(data.address_country || 'US');
        setState(data.state || '');
        setCity(data.city || '');
        setZipCode(data.zip_code || '');
      }
    };

    loadData();
  }, []);

  // Validation functions
  const validateAddressLine1 = (value: string): string | undefined => {
    if (!value.trim()) return 'Address is required';
    if (value.trim().length < 5) return 'Address is too short';
    if (value.trim().length > 100) return 'Address is too long';
    // Check for basic address format (should contain letters and numbers)
    if (!/[a-zA-Z]/.test(value)) return 'Please enter a valid address';
    return undefined;
  };

  const validateZipCode = (value: string): string | undefined => {
    if (!value.trim()) return 'ZIP code is required';
    // Allow 5 or 6 digit ZIP codes
    if (!/^\d{5,6}$/.test(value.trim())) return 'ZIP code must be 5 or 6 digits';
    return undefined;
  };

  const validateCountry = (value: string): string | undefined => {
    if (!value) return 'Please select a country';
    return undefined;
  };

  const validateState = (value: string): string | undefined => {
    if (!value) return 'Please select a state';
    return undefined;
  };

  const validateCity = (value: string): string | undefined => {
    if (!value) return 'Please select a city';
    return undefined;
  };

  // Handle field blur (mark as touched)
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field on blur
    let error: string | undefined;
    switch (field) {
      case 'addressLine1':
        error = validateAddressLine1(addressLine1);
        break;
      case 'zipCode':
        error = validateZipCode(zipCode);
        break;
      case 'country':
        error = validateCountry(country);
        break;
      case 'state':
        error = validateState(state);
        break;
      case 'city':
        error = validateCity(city);
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {
      addressLine1: validateAddressLine1(addressLine1),
      country: validateCountry(country),
      state: validateState(state),
      city: validateCity(city),
      zipCode: validateZipCode(zipCode),
    };
    
    setFieldErrors(errors);
    setTouched({
      addressLine1: true,
      country: true,
      state: true,
      city: true,
      zipCode: true,
    });
    
    return !Object.values(errors).some(e => e !== undefined);
  };

  const handleContinue = async () => {
    // Validate all fields first
    if (!validateAllFields()) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.trim() || null,
        address_country: country,
        state: state,
        city: city,
        zip_code: zipCode.trim(),
        current_step: 10,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-11');
  };

  const handleBack = () => {
    navigate('/onboarding/step-9');
  };

  const isValid = addressLine1.trim() && country && state && city && zipCode.trim();

  return (
    <div 
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
        
        {/* Fixed Header - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <header className="fixed top-0 z-20 w-full max-w-[500px] flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]" data-onboarding-header>
            <button 
              onClick={handleBack}
              aria-label="Go back"
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
            >
              <BackIcon />
            </button>
            <button 
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
              aria-label="Help"
            >
              <HelpIcon />
            </button>
          </header>
        )}
        
        {/* Spacer for fixed header */}
        <div className="h-16" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 pb-48 overflow-y-auto">
          {/* Header Section - Center Aligned */}
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 text-[22px] font-bold leading-tight tracking-tight mb-3">
              Enter your address
            </h1>
            <p className="text-slate-500 text-[14px] font-normal leading-relaxed">
              Please provide your primary residence address.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form Card 1: Street Address */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 mb-6 space-y-5">
            {/* Address Line 1 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="address1">
                Address line 1
              </label>
              <input
                id="address1"
                type="text"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  // Clear error when user starts typing
                  if (touched.addressLine1) {
                    setFieldErrors(prev => ({ ...prev, addressLine1: validateAddressLine1(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('addressLine1')}
                placeholder="Street address"
                className={`w-full h-12 px-4 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 transition-all ${
                  touched.addressLine1 && fieldErrors.addressLine1
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee]'
                }`}
              />
              {/* Error or Helper Text */}
              {touched.addressLine1 && fieldErrors.addressLine1 ? (
                <p className="text-red-500 text-xs font-normal leading-tight mt-1">
                  {fieldErrors.addressLine1}
                </p>
              ) : (
                <div className="flex items-start gap-1.5 mt-1.5">
                  <InfoIcon />
                  <p className="text-slate-400 text-xs font-normal leading-tight">
                    Use your street address, not a P.O. Box.
                  </p>
                </div>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="block text-sm font-medium text-slate-900" htmlFor="address2">
                  Address line 2
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="address2"
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apt, suite, unit, etc."
                className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all"
              />
            </div>
          </div>

          {/* Form Card 2: Region Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 space-y-5 mb-4">
            {/* Country */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="country">
                Country
              </label>
              <div className="relative">
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setState('');
                    setCity('');
                  }}
                  className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-200 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all appearance-none"
                >
                  <option value="">Select country...</option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* State & City Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-900" htmlFor="state">
                  State
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setCity('');
                    }}
                    disabled={!country || loadingLocations}
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-200 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-900" htmlFor="city">
                  City
                </label>
                <div className="relative">
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!state || loadingLocations}
                    className="w-full h-12 px-4 pr-10 rounded-lg border border-gray-200 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* ZIP Code */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-900" htmlFor="zip">
                ZIP code
              </label>
              <input
                id="zip"
                type="text"
                value={zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setZipCode(value);
                  // Update validation on change
                  if (touched.zipCode) {
                    setFieldErrors(prev => ({ ...prev, zipCode: validateZipCode(value) }));
                  }
                }}
                onBlur={() => handleBlur('zipCode')}
                inputMode="numeric"
                placeholder="00000"
                className={`w-full h-12 px-4 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 transition-all ${
                  touched.zipCode && fieldErrors.zipCode
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee]'
                }`}
              />
              {/* Error or Helper Text */}
              {touched.zipCode && fieldErrors.zipCode ? (
                <p className="text-red-500 text-xs font-normal leading-tight mt-1">
                  {fieldErrors.zipCode}
                </p>
              ) : (
                <p className="text-slate-400 text-xs font-normal leading-tight mt-1">
                  Enter 5 or 6 digit ZIP code
                </p>
              )}
            </div>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex flex-col gap-3" data-onboarding-footer>
            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!isValid || loading}
              className={`
                flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-5 text-base font-bold tracking-wide transition-all active:scale-[0.98]
                ${isValid && !loading
                  ? 'bg-[#2b8cee] hover:bg-[#2070c0] text-white shadow-lg shadow-[#2b8cee]/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
            
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingStep10;
