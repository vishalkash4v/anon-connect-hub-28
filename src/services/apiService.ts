
const BASE_URL = 'https://rcapis.best-smm.in/apis/v1';

export interface CreateProfileRequest {
  name: string;
  phone: string;
  email: string;
}

export interface JoinAnonymousRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface GetProfileRequest {
  userId: string;
}

export interface UpdateProfileRequest {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface CreateGroupRequest {
  group_name: string;
  description?: string;
  createdBy?: string;
}

export interface JoinGroupRequest {
  groupId: string;
  userId: string;
}

export interface OpenGroupChatRequest {
  groupId: string;
  lastMessageId?: string;
  limit?: number;
}

export interface OpenOneToOneChatRequest {
  userId: string;
  otherUserId: string;
  lastMessageId?: string;
  limit?: number;
}

export interface OpenRandomChatRequest {
  userId: string;
}

export interface SearchRequest {
  query?: string;
  groupId?: string;
  userId?: string;
}

class ApiService {
  private async makeRequest(endpoint: string, data: Record<string, any>) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async createProfile(data: CreateProfileRequest) {
    return this.makeRequest('/create-profile', data);
  }

  async joinAnonymous(data: JoinAnonymousRequest = {}) {
    return this.makeRequest('/join-anonymous', data);
  }

  async getProfile(data: GetProfileRequest) {
    return this.makeRequest('/get-profile', data);
  }

  async updateProfile(data: UpdateProfileRequest) {
    return this.makeRequest('/update-profile', data);
  }

  async createGroup(data: CreateGroupRequest) {
    return this.makeRequest('/create-group', data);
  }

  async joinGroup(data: JoinGroupRequest) {
    return this.makeRequest('/join-group', data);
  }

  async openGroupChat(data: OpenGroupChatRequest) {
    return this.makeRequest('/open-group-chat', data);
  }

  async openOneToOneChat(data: OpenOneToOneChatRequest) {
    return this.makeRequest('/open-one-to-one-chat', data);
  }

  async openRandomChat(data: OpenRandomChatRequest) {
    return this.makeRequest('/open-random-chat', data);
  }

  async search(data: SearchRequest) {
    return this.makeRequest('/search', data);
  }
}

export const apiService = new ApiService();
