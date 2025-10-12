// Will use axios when the API is implemented
// import axios from "../../config/axios";

interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

class AuthServices {
  static async login(params: LoginParams) {
    // This is a mock implementation since there's no actual API yet
    // In a real scenario, this would make an API call to your authentication endpoint
    
    console.log('Login attempt with:', params);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - replace with actual API call when available
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      userProfile: {
        username: params.username,
        roleCode: params.username === "admin" ? "R1" : 
                  params.username === "hr" ? "R2" : 
                  params.username === "manager" ? "R3" : "R4"
      }
    };
  }
}

export default AuthServices;
