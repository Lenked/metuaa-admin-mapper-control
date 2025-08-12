const API_BASE_URL = 'https://dev.metuaa.com/api';
const API_KEY = 'EKJ0BDHKQ2MGNV3S26GVFMV3ZXSN1DMK';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluQG1ldHVhYS5vcmciLCJ1aWQiOjJ9.IVq2qul-eEnyvdhaFndrLK5WDZ0A0-uOKTJ7QV8mhWw';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': API_KEY,
  'token': TOKEN
});

export class OdooAPI {

  static async getUserInfo(matricule: string): Promise<any> {
    try {
      const domain = encodeURIComponent(`[('matricule','=','${matricule}')]`);
      const response = await fetch(`${API_BASE_URL}/res.partner/search?domain=${domain}`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  static async getUserInfoWithId(id: BigInteger): Promise<any> {
    try {
      const domain = encodeURIComponent(`[('id','=','${id}')]`);
      const response = await fetch(`${API_BASE_URL}/res.partner/search?domain=${domain}`, {
        method: 'GET',
        headers: getHeaders(),
        body: JSON.stringify({
          db: "metua_erp_db"
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}