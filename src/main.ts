import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { tap } from "rxjs/operators";
import {
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
function loggingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  //   const req = request.clone({
  //     headers: request.headers.set("X-DEBUG", "TESTING"),
  //   });
  console.log("Outgoing request:", request);
  return next(request).pipe(
    tap({
      next: (event) => {
        console.log("Response received:", event);
      },
    })
  );
}
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
}).catch((err) => console.error(err));
