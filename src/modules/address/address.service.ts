import { EnvironmentVariables } from "config/environment-variables";
import { Client, DistanceMatrixResponse, GeocodeResponse, LatLng } from "@googlemaps/google-maps-services-js";
import config from "config/config";
import { BadRequestError } from "errors/errors";
import { AxiosError } from "axios";
import { RateLimiter } from "limiter";

export class AddressService {
  private readonly googleMapsClient: Client;
  private readonly config: EnvironmentVariables;
  private readonly batchSize = 25; // Batch size for requests
  private readonly limiter: RateLimiter;
  constructor() {
    this.googleMapsClient = new Client();
    this.config = config;
    this.limiter = new RateLimiter({ tokensPerInterval: 10, interval: "second" });
  }

  public async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    let response: GeocodeResponse;
    try {
      response = await this.googleMapsClient.geocode({
        params: { key: this.config.GOOGLE_MAPS_API_KEY, address },
      });
    } catch (e: any) {
      const error = e as AxiosError;
      throw new Error(error.message);
    }
    if (!response.data.results.length) {
      throw new BadRequestError(`Address: ${address} not found`);
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  }

  public async getDistanceMatrix({
    origin,
    destinations,
  }: {
    origin: { lat: number; lng: number };
    destinations: { lat: number; lng: number }[];
  }): Promise<number[]> {
    // Initialize an array to store the distances
    const distances: number[] = [];
    // Send requests in batches
    for (const batchDestinations of this.splitIntoBatches(destinations)) {
      await this.limiter.removeTokens(1);
      const batchResponse = await this.sendDistanceMatrixRequest(origin, batchDestinations);
      distances.push(...batchResponse);
    }

    return distances;
  }

  // Helper function to split data into batches
  private splitIntoBatches<T>(data: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < data.length; i += this.batchSize) {
      batches.push(data.slice(i, i + this.batchSize));
    }
    return batches;
  }

  // Helper function to send a batch of distance matrix requests
  private async sendDistanceMatrixRequest(
    origin: { lat: number; lng: number },
    destinations: { lat: number; lng: number }[],
  ): Promise<number[]> {
    let response: DistanceMatrixResponse;
    try {
      response = await this.googleMapsClient.distancematrix({
        params: { key: this.config.GOOGLE_MAPS_API_KEY, origins: [origin as LatLng], destinations: destinations as LatLng[] },
      });
    } catch (e: any) {
      const error = e as AxiosError;
      throw new Error(error.message);
    }
    // Extract distances from the response and return as an array
    return response.data.rows[0].elements.map(l => l.distance.value);
  }
}
