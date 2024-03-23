import { AddressService } from "./address.service";
import { when } from "jest-when";
import config from "config/config";
let mock: jest.Mock;

jest.mock("@googlemaps/google-maps-services-js", () => {
  return {
    __esModule: true,
    Client: class {
      public geocode = mock;
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
      const inputAddress: string = "Andersenstr. 3 10439";
      const response = { data: { results: [{ geometry: { location: { lat: 42, lng: 42 } } }] } };
      mock = jest.fn();
      when(mock)
        .calledWith({ params: { key: config.GOOGLE_MAPS_API_KEY, address: inputAddress } })
        .mockReturnValue(response);

      addressService = new AddressService();

      const { lat, lng } = await addressService.getCoordinatesFromAddress(inputAddress);
      expect(lat).toBe(42);
      expect(lng).toBe(42);
    });
  });
});
