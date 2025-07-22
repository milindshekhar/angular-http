import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Place } from "./place.model";
import { catchError, map, throwError, tap } from "rxjs";
import { ErrorService } from "../shared/error.service";

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      "http://localhost:3000/places",
      "Failed to load available places.please try again later."
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      "http://localhost:3000/user-places",
      "Failed to load the available places.please try again later."
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }
    return this.httpClient
      .put("http://localhost:3000/user-places/", {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces); // Revert to previous state on error
          this.errorService.showError("Failed to store selected place");
          return throwError(
            () =>
              new Error(
                "Failed to add place to user places. Please try again later."
              )
          );
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if (prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter((p) => p.id !== place.id));
    }

    return this.httpClient
      .delete("http://localhost:3000/user-places/" + place.id)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces); // Revert to previous state on error
          this.errorService.showError(
            "Failed to remove place from user places"
          );
          return throwError(
            () =>
              new Error(
                "Failed to remove place from user places. Please try again later."
              )
          );
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((resData) => resData.places),
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
