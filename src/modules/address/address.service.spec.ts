import { AddressService } from "./address.service";
import { when } from "jest-when";
import config from "config/config";
import { AxiosError, AxiosResponse } from "axios";
import { BadRequestError, UnauthorizedError } from "errors/errors";
import { LatLng } from "@googlemaps/google-maps-services-js";

let geocodeMock: jest.Mock;
let distanceMatrixMock: jest.Mock;

jest.mock("@googlemaps/google-maps-services-js", () => {
  return {
    __esModule: true,
    Client: class {
      public geocode = geocodeMock;
      public distancematrix = distanceMatrixMock;
    },
  };
});

describe("AddressService", () => {
  let addressService: AddressService;

  describe(".getCoordinatesFromAddress", () => {
    it("should return coordinates when passed the correct api key and the provided address", async () => {
      const inputAddress: string = "Andersenstr. 3 10439";
      const expectedResponse = { data: { results: [{ geometry: { location: { lat: 42, lng: 42 } } }] } };
      geocodeMock = jest.fn();
      when(geocodeMock)
        .calledWith({ params: { key: config.GOOGLE_MAPS_API_KEY, address: inputAddress } })
        .mockReturnValue(expectedResponse);

      addressService = new AddressService();

      const { lat, lng } = await addressService.getCoordinatesFromAddress(inputAddress);
      expect(lat).toBe(expectedResponse.data.results[0].geometry.location.lat);
      expect(lng).toBe(expectedResponse.data.results[0].geometry.location.lng);
    });

    it("should throw a bad reqeuest error when passed the correct api key but an invalid address", async () => {
      const inputAddress: string = "Invalid address";
      const expectedResponse = { data: { results: [] } };
      geocodeMock = jest.fn();
      when(geocodeMock)
        .calledWith({ params: { key: config.GOOGLE_MAPS_API_KEY, address: inputAddress } })
        .mockReturnValue(expectedResponse);

      addressService = new AddressService();

      await addressService.getCoordinatesFromAddress(inputAddress).catch((error: BadRequestError) => {
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toBe("Address not found");
      });
    });

    it("should throw an unauthorized error when passed an invalid API key", async () => {
      config.GOOGLE_MAPS_API_KEY = "now im wrong";
      const inputAddress: string = "Invalid address";
      geocodeMock = jest.fn();
      when(geocodeMock)
        .calledWith({ params: { key: config.GOOGLE_MAPS_API_KEY, address: inputAddress } })
        .mockRejectedValue(new AxiosError(undefined, undefined, undefined, null, { status: 403 } as AxiosResponse));

      addressService = new AddressService();

      await addressService.getCoordinatesFromAddress(inputAddress).catch((error: UnauthorizedError) => {
        expect(error).toBeInstanceOf(UnauthorizedError);
      });
    });
    it("should throw an error when call failed for any reason", async () => {
      config.GOOGLE_MAPS_API_KEY = "could be right or wrong";
      const inputAddress: string = "could be right or wrong";
      geocodeMock = jest.fn();
      const expectedMessage = "something awful happened";
      when(geocodeMock)
        .calledWith({ params: { key: config.GOOGLE_MAPS_API_KEY, address: inputAddress } })
        .mockRejectedValue(new AxiosError(expectedMessage, undefined, undefined, null, { status: 500 } as AxiosResponse));

      addressService = new AddressService();

      await addressService.getCoordinatesFromAddress(inputAddress).catch((error: UnauthorizedError) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(expectedMessage);
      });
    });
  });

  describe(".getDistanceMatrix", () => {
    it("should return a distance when provided with a valid api key and two valid addresses", async () => {
      const origin = { lat: 42, lng: 42 };
      const destinations = [{ lat: 36, lng: 36 }];
      distanceMatrixMock = jest.fn();
      const expectedResponse = { data: { rows: [{ elements: [{ distance: { value: 0 } }, { distance: { value: 18 } }] }] } };
      when(distanceMatrixMock)
        .calledWith({
          params: { key: config.GOOGLE_MAPS_API_KEY, origins: [origin as LatLng], destinations: destinations as LatLng[] },
        })
        .mockReturnValue(expectedResponse);

      addressService = new AddressService();
      const response = await addressService.getDistanceMatrix({ origin, destinations });
      console.log(response);
      expect(response).toEqual([0, 18]);
    });
  });
});
