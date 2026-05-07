export type IpLookupData = {
  ip: string;
  countryName: string;
  countryFlag: string;
  stateOrRegion: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  isp: string;
  organization: string;
  connectionType: string;
  timezoneName: string;
  currentLocalTime: string;
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  callingCode: string;
};

export type IpLookupResult =
  | {
      ok: true;
      cached: boolean;
      data: IpLookupData;
    }
  | {
      ok: false;
      error: {
        title: string;
        message: string;
        status?: number;
      };
    };
