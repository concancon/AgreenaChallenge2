//jest.mock("@googlemaps/google-maps-services-js");
import config from "config/config";
import { AddressService } from "./address.service";
import type * as OriginalGoogleMapsServices from "@googlemaps/google-maps-services-js";
jest.mock("@googlemaps/google-maps-services-js", () => {
  const originalModule = jest.requireActual<typeof OriginalGoogleMapsServices>("@googlemaps/google-maps-services-js");
  return {
    __esModule: true,
    ...originalModule,
    Client: class {
      public geocode(args: { params: { key: string; address: string } }) {
        if (args.params.key === config.GOOGLE_MAPS_API_KEY && typeof args.params.address === "string")
          return {
            data: {
              results: [
                {
                  geometry: {
                    location: {
                      lat: 42,
                      lng: 42,
                    },
                  },
                },
              ],
            },
          };
      }
    },
  };
});

describe("AddressService", () => {
  let addressService: AddressService;

  beforeAll(async () => {});

  afterAll(async () => {});

  beforeEach(() => {});

  describe(".getCoordinatesFromAddress", () => {
    it("should create new farm", async () => {
      addressService = new AddressService();

      const input: string = "Andersenstr. 3 10439";
      const { lat, lng } = await addressService.getCoordinatesFromAddress(input);
      expect(lat).toBe(42);
      expect(lng).toBe(42);
    });
  });
});
