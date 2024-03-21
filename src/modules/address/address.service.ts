import { EnvironmentVariables } from "config/environment-variables";
import { Client } from "@googlemaps/google-maps-services-js";
import config from "config/config";

export class AddressService {
  private readonly googleMapsClient: Client;
  private readonly config: EnvironmentVariables;
  constructor() {
    this.googleMapsClient = new Client();
    this.config = config;
  }

  public async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    const response = await this.googleMapsClient.geocode({
      params: { key: this.config.GOOGLE_MAPS_API_KEY, address },
    });
    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  }
}
