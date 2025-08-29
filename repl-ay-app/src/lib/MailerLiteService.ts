// MailerLiteService.ts - Handles newsletter subscription integration
export class MailerLiteService {
  private static readonly API_BASE = 'https://connect.mailerlite.com/api';
  private static readonly API_KEY = process.env.MAILERLITE_API_KEY;

  /**
   * Add subscriber to MailerLite newsletter list
   */
  static async addSubscriber(email: string, additionalData: {
    firstName?: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
  } = {}) {
    if (!this.API_KEY) {
      console.warn('MailerLite API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      const payload = {
        email,
        fields: {
          name: additionalData.firstName && additionalData.lastName 
            ? `${additionalData.firstName} ${additionalData.lastName}`
            : additionalData.firstName || '',
          last_name: additionalData.lastName || '',
          company: additionalData.company || '',
          job_title: additionalData.jobTitle || ''
        },
        status: 'active', // Automatically confirm subscription
        opted_in_at: new Date().toISOString(),
        optin_ip: '127.0.0.1' // You can pass real IP from request
      };

      const response = await fetch(`${this.API_BASE}/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Successfully added subscriber to MailerLite:', email);
        return { 
          success: true, 
          subscriberId: result.data?.id,
          message: 'Subscriber added successfully' 
        };
      } else {
        // Handle specific MailerLite errors
        if (result.message?.includes('already exists') || result.errors?.email?.[0]?.includes('already exists')) {
          console.log('📧 Subscriber already exists in MailerLite:', email);
          return { 
            success: true, 
            message: 'Subscriber already exists',
            alreadyExists: true 
          };
        }

        console.error('❌ MailerLite API error:', result);
        return { 
          success: false, 
          error: result.message || 'Failed to add subscriber' 
        };
      }

    } catch (error) {
      console.error('❌ MailerLite service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update subscriber information in MailerLite
   */
  static async updateSubscriber(email: string, updates: {
    firstName?: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
  }) {
    if (!this.API_KEY) {
      console.warn('MailerLite API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      // First find the subscriber by email
      const findResponse = await fetch(`${this.API_BASE}/subscribers/${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!findResponse.ok) {
        // Subscriber doesn't exist, add them instead
        return this.addSubscriber(email, updates);
      }

      const subscriber = await findResponse.json();
      const subscriberId = subscriber.data.id;

      // Update the subscriber
      const updatePayload = {
        fields: {
          name: updates.firstName && updates.lastName 
            ? `${updates.firstName} ${updates.lastName}`
            : updates.firstName || '',
          last_name: updates.lastName || '',
          company: updates.company || '',
          job_title: updates.jobTitle || ''
        }
      };

      const updateResponse = await fetch(`${this.API_BASE}/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (updateResponse.ok) {
        console.log('✅ Successfully updated subscriber in MailerLite:', email);
        return { 
          success: true, 
          message: 'Subscriber updated successfully' 
        };
      } else {
        const error = await updateResponse.json();
        console.error('❌ MailerLite update error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to update subscriber' 
        };
      }

    } catch (error) {
      console.error('❌ MailerLite update service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Remove subscriber from MailerLite (GDPR compliance)
   */
  static async removeSubscriber(email: string) {
    if (!this.API_KEY) {
      console.warn('MailerLite API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.API_BASE}/subscribers/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Successfully removed subscriber from MailerLite:', email);
        return { 
          success: true, 
          message: 'Subscriber removed successfully' 
        };
      } else {
        const error = await response.json();
        console.error('❌ MailerLite removal error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to remove subscriber' 
        };
      }

    } catch (error) {
      console.error('❌ MailerLite removal service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default MailerLiteService;