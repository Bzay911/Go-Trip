/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/communityPage` | `/(tabs)/dynamicPlanner` | `/(tabs)/profile` | `/(tabs)/search` | `/_sitemap` | `/communityPage` | `/dynamicPlanner` | `/placeDetailsScreen` | `/placesContext` | `/profile` | `/recommendedPlacesList` | `/search` | `/uploadScreen`;
      DynamicRoutes: `/addComment/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/addComment/[postId]`;
    }
  }
}
