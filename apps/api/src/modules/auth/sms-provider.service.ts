export interface SmsDispatchResult {
  success: boolean;
  messageId?: string;
  gateway?: string;
  error?: string;
}

export interface DispatchedSmsLog {
  phoneNumber: string;
  message: string;
  timestamp: Date;
  messageId: string;
}

export interface SmsProvider {
  sendSms(phoneNumber: string, message: string): Promise<SmsDispatchResult>;
  getSentMessages(): DispatchedSmsLog[];
  getLastOtp(phoneNumber: string): string | undefined;
  clear(): void;
}

/**
 * Mock Bangladeshi SMS Gateway Provider with adapters for standard BD SMS aggregators
 * (SSL Wireless, Greenweb, Onnorokom SMS).
 */
export class MockBangladeshiSmsProvider implements SmsProvider {
  private sentMessages: DispatchedSmsLog[] = [];

  async sendSms(phoneNumber: string, message: string): Promise<SmsDispatchResult> {
    const messageId = `bd_sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const logEntry: DispatchedSmsLog = {
      phoneNumber,
      message,
      timestamp: new Date(),
      messageId,
    };

    this.sentMessages.push(logEntry);

    // Simulated Bangladeshi Gateway Log
    // console.log(`[BD SMS GATEWAY ADAPTER: SSL Wireless] Dispatched to ${phoneNumber} -> "${message}" (ID: ${messageId})`);

    return {
      success: true,
      messageId,
      gateway: "SSL_WIRELESS_MOCK",
    };
  }

  getSentMessages(): DispatchedSmsLog[] {
    return [...this.sentMessages];
  }

  getLastOtp(phoneNumber: string): string | undefined {
    const messagesForPhone = this.sentMessages.filter((m) => m.phoneNumber === phoneNumber);
    if (messagesForPhone.length === 0) return undefined;
    const lastMsg = messagesForPhone[messagesForPhone.length - 1]!.message;
    const match = lastMsg.match(/\b\d{6}\b/);
    return match ? match[0] : undefined;
  }

  clear(): void {
    this.sentMessages = [];
  }
}

export const defaultSmsProvider = new MockBangladeshiSmsProvider();
