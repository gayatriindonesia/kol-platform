"use client";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllCategories } from '@/lib/category.actions';
import { getAllPaymentMethods, getBanksByPaymentMethod } from '@/lib/payment.actions';
import useCampaignAppStore from '@/storeCampaign';
import { useEffect, useMemo, useState } from 'react';
import { Wallet, Tag, CheckCircle2, X, CreditCard, Building2, Smartphone, CurrencyIcon, AlertCircle} from 'lucide-react';

// Types
interface TransformedCategory {
  id: string;
  name: string;
  description?: string;
}

type Bank = {
  id: string;
  name: string;
  isActive: boolean;
  accountNumber?: string | null;
  accountName?: string | null;
  paymentMethodId: string;
};

interface PaymentMethodOption {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  banks?: Bank[];
}

const DirectCampaignSetup = () => {
  const {
    formData,
    setDirectCategories,
    setDirectCampaignData,
  } = useCampaignAppStore();

  const [loading, setLoading] = useState(true);
  const [displayValue, setDisplayValue] = useState("");
  const [allCategories, setAllCategories] = useState<TransformedCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [availableBanks, setAvailableBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  

  // Icon mapping untuk payment methods
  const getPaymentIcon = (code: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'BANK_TRANSFER': Building2,
      'E_WALLET': Smartphone,
      'CREDIT_CARD': CreditCard,
      'DEBIT_CARD': CreditCard,
    };
    return iconMap[code] || Building2;
  };

  // Payment schedule options - SEMENTARA TIDAK DIGUNAKAN
  // const paymentScheduleOptions = [
  //   { value: 'dp', label: 'DP' },
  //   { value: 'after_posting', label: 'Setelah Posting' }
  // ];

  // Formatter IDR
  const formatter = useMemo(() => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }), []);

  // Sync displayValue saat formData.direct.budget berubah
  useEffect(() => {
    setDisplayValue(formatter.format(formData.direct.budget));
  }, [formData.direct.budget, formatter]);

  // Handle budget change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericString = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(numericString || "0", 10);
    setDirectCampaignData({ budget: numericValue });
    setDisplayValue(formatter.format(numericValue));
  };

  // Handle payment schedule change - SEMENTARA TIDAK DIGUNAKAN
  // const handlePaymentScheduleChange = (value: string) => {
  //   setDirectCampaignData({ paymentSchedule: value });
  // };

  // Handle category selection
  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) return;

    let updatedCategories;
    if (isChecked) {
      if (!formData.direct.categories.find(c => c.id === categoryId)) {
        updatedCategories = [...formData.direct.categories, category];
      } else {
        updatedCategories = formData.direct.categories;
      }
    } else {
      updatedCategories = formData.direct.categories.filter(c => c.id !== categoryId);
    }

    setDirectCampaignData({ categories: updatedCategories });
  };

  // Remove selected category
  const removeCategory = (categoryId: string) => {
    const updatedCategories = formData.direct.categories.filter(c => c.id !== categoryId);
    setDirectCampaignData({ categories: updatedCategories });
  };

  // Handle payment method change
  const handlePaymentMethodChange = async (paymentMethodId: string) => {
    setDirectCampaignData({ 
      paymentMethod: paymentMethodId,
      bankId: undefined // Reset bank selection
    });

    // Load banks for selected payment method
    if (paymentMethodId) {
      setLoadingBanks(true);
      try {
        const { data, status } = await getBanksByPaymentMethod(paymentMethodId);
        if (status === 200 && data) {
          setAvailableBanks(data);
        }
      } catch (error) {
        console.error('Failed to load banks:', error);
        setAvailableBanks([]);
      } finally {
        setLoadingBanks(false);
      }
    } else {
      setAvailableBanks([]);
    }
  };

  // Handle bank selection
  const handleBankChange = (bankId: string) => {
    setDirectCampaignData({ bankId });
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const { data: categoriesData, status: categoriesStatus } = await getAllCategories();
        if (categoriesStatus === 200 && categoriesData) {
          const transformedCategories: TransformedCategory[] = categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            ...(c.description && { description: c.description })
          }));
          setAllCategories(transformedCategories);
          setDirectCategories(transformedCategories);
        }

        // Load payment methods
        const { data: paymentData, status: paymentStatus } = await getAllPaymentMethods();
        console.log("Isi payment",paymentData)
        if (paymentStatus === 200 && paymentData) {
          const transformedPaymentMethods: PaymentMethodOption[] = paymentData.map(pm => ({
            id: pm.id,
            name: pm.name,
            code: pm.code,
            description: pm.description || `Pay via ${pm.name}`,
            icon: getPaymentIcon(pm.code),
            popular: pm.code === 'E_WALLET', // Mark e-wallet as popular
            banks: pm.banks,
          }));
          setPaymentMethods(transformedPaymentMethods);
        }

        // Load banks if payment method already selected
        if (formData.direct.paymentMethod) {
          const { data: banksData, status: banksStatus } = await getBanksByPaymentMethod(formData.direct.paymentMethod);
          if (banksStatus === 200 && banksData) {
            setAvailableBanks(banksData);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setDirectCategories, formData.direct.paymentMethod]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === formData.direct.paymentMethod);
  const selectedBank = availableBanks.find(bank => bank.id === formData.direct.bankId);
  // const selectedSchedule = paymentScheduleOptions.find(option => option.value === formData.direct.paymentSchedule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
            <CurrencyIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Budget & Payment</h3>
            <p className="text-gray-600 mt-1">Set your budget and payment details</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1">
            Step 3 of 8
          </Badge>
        </div>
      </div>

      {/* Budget Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Campaign Budget</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Set your total campaign budget in Indonesian Rupiah
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
              IDR
            </div>
            <Input
              id="budget"
              type="text"
              value={displayValue}
              onChange={handleChange}
              className="pl-14 h-12 text-lg font-semibold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="0"
            />
          </div>
          {formData.direct.budget > 0 && (
            <div className="mt-3 p-3 bg-white/70 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                Budget: <span className="font-semibold text-blue-700">{displayValue}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Payment Method</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Choose your preferred payment method for this campaign
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.direct.paymentMethod || ""}
            onValueChange={handlePaymentMethodChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = formData.direct.paymentMethod === method.id;
              return (
                <div key={method.id} className="relative">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-300 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${
                          isSelected ? 'text-orange-800' : 'text-gray-900'
                        }`}>
                          {method.name}
                        </h3>
                        {method.popular && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        isSelected ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Bank Selection - Show when payment method is selected and has banks */}
          {selectedPaymentMethod && availableBanks.length > 0 && (
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Select Bank {selectedPaymentMethod.code === 'BANK_TRANSFER' && <span className="text-red-500">*</span>}
              </Label>
              {loadingBanks ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={formData.direct.bankId || ""} onValueChange={handleBankChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBanks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span>{bank.name}</span>
                          {bank.accountName && (
                            <span className="text-xs text-gray-500">({bank.accountName})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Payment method summary */}
          {formData.direct.paymentMethod && (
            <div className="mt-4 p-4 bg-white/70 rounded-lg border border-orange-200">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  <p className="text-sm text-gray-700">
                    Payment Method: <span className="font-semibold text-orange-700">
                      {selectedPaymentMethod?.name}
                    </span>
                  </p>
                </div>
                {selectedBank && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-orange-500" />
                    <p className="text-sm text-gray-700">
                      Bank: <span className="font-semibold text-orange-700">
                        {selectedBank.name}
                      </span>
                      {selectedBank.accountName && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({selectedBank.accountName})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning for bank transfer without bank selection */}
          {selectedPaymentMethod?.code === 'BANK_TRANSFER' && !formData.direct.bankId && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Please select a bank for bank transfer payments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Payment Section - SEMENTARA DINONAKTIFKAN */}
      {/* 
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Jadwal Pembayaran</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Pilih kapan jadwal pembayaran akan dilakukan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Pilih Jadwal Pembayaran <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.direct.paymentSchedule || ""} 
              onValueChange={handlePaymentScheduleChange}
            >
              <SelectTrigger className="w-full h-12 border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-100">
                <SelectValue placeholder="Pilih jadwal pembayaran..." />
              </SelectTrigger>
              <SelectContent>
                {paymentScheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.direct.paymentSchedule && (
              <div className="p-3 bg-white/70 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  <p className="text-sm text-gray-700">
                    Jadwal Pembayaran: <span className="font-semibold text-purple-700">
                      {selectedSchedule?.label}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {formData.direct.paymentSchedule === 'dp' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Pembayaran DP</p>
                  <p>Pembayaran akan dilakukan di awal sebagai uang muka sebelum campaign dimulai.</p>
                </div>
              </div>
            )}

            {formData.direct.paymentSchedule === 'after_posting' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Setelah Posting</p>
                  <p>Pembayaran akan dilakukan setelah konten campaign berhasil dipublikasikan.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      */}

      {/* Categories Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Campaign Categories</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Select relevant categories for your campaign targeting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selected Categories */}
          {formData.direct.categories.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <Label className="text-sm font-medium text-gray-700">
                  Selected Categories ({formData.direct.categories.length})
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.direct.categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 transition-colors group cursor-pointer"
                    onClick={() => removeCategory(category.id)}
                  >
                    <span className="mr-2">{category.name}</span>
                    <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Categories */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Available Categories
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allCategories.map((category) => {
                const isSelected = formData.direct.categories.some(c => c.id === category.id);
                return (
                  <div
                    key={category.id}
                    className={`relative flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategoryChange(category.id, !isSelected)}
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={isSelected}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`category-${category.id}`}
                        className={`text-sm font-medium cursor-pointer block ${
                          isSelected ? 'text-green-800' : 'text-gray-900'
                        }`}
                      >
                        {category.name}
                      </label>
                      {category.description && (
                        <p className={`text-xs mt-1 ${
                          isSelected ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {category.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {allCategories.length === 0 && !loading && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectCampaignSetup;