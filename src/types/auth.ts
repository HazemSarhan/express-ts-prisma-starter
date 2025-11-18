export interface JwtPayload {
  userId: string;
  name?: string;
  email?: string;
  role: string;
  refreshToken?: string;
}
