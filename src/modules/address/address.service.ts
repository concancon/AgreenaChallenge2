import { EnvironmentVariables } from "config/environment-variables";
import { Client, GeocodeResponse } from "@googlemaps/google-maps-services-js";
import config from "config/config";
import { BadRequestError, UnauthorizedError } from "errors/errors";
import { AxiosError } from "axios";

export class AddressService {
  private readonly googleMapsClient: Client;
  private readonly config: EnvironmentVariables;
  constructor() {
    this.googleMapsClient = new Client();
    this.config = config;
  }

  public async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    let response: GeocodeResponse;
    try {
      response = await this.googleMapsClient.geocode({
        params: { key: this.config.GOOGLE_MAPS_API_KEY, address },
      });
    } catch (e: any) {
      const error = e as AxiosError;
      if (error.response?.status === 403) throw new UnauthorizedError();
      else {
        throw new Error(error.message);
      }
    }
    if (!response.data.results.length) {
      throw new BadRequestError("Address not found");
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  }
}
