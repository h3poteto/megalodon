/// <reference path="emoji.ts" />
/// <reference path="note.ts" />
/// <reference path="field.ts" />

declare namespace FirefishEntity {
  export interface UserDetailMe extends UserDetail {
    alwaysMarkNsfw: boolean
  }
}
