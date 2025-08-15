"use server";

import { db } from '@/lib/db';
import { PaymentMethod, Bank } from '@prisma/client';

// Types untuk response
interface PaymentMethodWithBanks extends PaymentMethod {
  banks: Bank[];
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

// Get all payment methods dengan banks
export async function getAllPaymentMethods(): Promise<ApiResponse<PaymentMethodWithBanks[]>> {
  try {
    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        isActive: true,
      },
      include: {
        banks: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: paymentMethods,
      status: 200,
      message: 'Payment methods retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      data: null,
      status: 500,
      message: 'Failed to fetch payment methods',
    };
  }
}

// Get payment method by code
export async function getPaymentMethodByCode(code: string): Promise<ApiResponse<PaymentMethodWithBanks>> {
  try {
    const paymentMethod = await db.paymentMethod.findUnique({
      where: {
        code: code,
        isActive: true,
      },
      include: {
        banks: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!paymentMethod) {
      return {
        data: null,
        status: 404,
        message: 'Payment method not found',
      };
    }

    return {
      data: paymentMethod,
      status: 200,
      message: 'Payment method retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return {
      data: null,
      status: 500,
      message: 'Failed to fetch payment method',
    };
  }
}

// Get banks by payment method
export async function getBanksByPaymentMethod(paymentMethodId: string): Promise<ApiResponse<Bank[]>> {
  try {
    const banks = await db.bank.findMany({
      where: {
        paymentMethodId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: banks,
      status: 200,
      message: 'Banks retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching banks:', error);
    return {
      data: null,
      status: 500,
      message: 'Failed to fetch banks',
    };
  }
}

// Create payment method (admin only)
export async function createPaymentMethod(data: {
  name: string;
  code: string;
  description?: string;
}): Promise<ApiResponse<PaymentMethod>> {
  try {
    const paymentMethod = await db.paymentMethod.create({
      data,
    });

    return {
      data: paymentMethod,
      status: 201,
      message: 'Payment method created successfully',
    };
  } catch (error) {
    console.error('Error creating payment method:', error);
    return {
      data: null,
      status: 500,
      message: 'Failed to create payment method',
    };
  }
}

// Create bank (admin only)
export async function createBank(data: {
  name: string;
  paymentMethodId: string;
  accountNumber?: string;
  accountName?: string;
}): Promise<ApiResponse<Bank>> {
  try {
    const bank = await db.bank.create({
      data,
    });

    return {
      data: bank,
      status: 201,
      message: 'Bank created successfully',
    };
  } catch (error) {
    console.error('Error creating bank:', error);
    return {
      data: null,
      status: 500,
      message: 'Failed to create bank',
    };
  }
}