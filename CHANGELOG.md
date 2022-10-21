# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.14.3] - 2022-10-21

### Changed

- Improve the organization binding setting UI

## [1.14.2] - 2022-10-20

### Fixed

-  bugfix on mkt tags UI

## [1.14.1] - 2022-10-19

### Changed

- Move the sales channel to a separate tab and made it radio type field

## [1.14.0] - 2022-10-11

### Added

- Added the marketing tags handling on the cost center details

## [1.13.1] - 2022-09-28

### Changed

- Reusable workflow updated to version 2

## [1.13.0] - 2022-09-27

### Added

- Added sales channels binding selection setting

## [1.12.1] - 2022-07-22

### Added

- Added a warning message when the customer schema is invalid.

## [1.12.0] - 2022-07-21

### Added

- Translations for all Storefront languages.

### Fixed

- English translations.

## [1.11.3] - 2022-07-19

### Fixed

- Fixed on update the user data, and it disappeared from the list

## [1.11.2] - 2022-07-06

### Fixed

- Fixed organization bulk action button text.

## [1.11.1] - 2022-07-04

### Added

- Initial Crowdin integration

## [1.11.0] - 2022-06-23
- 
### Added
- UI support for organization `tradeName` and cost center `phoneNumber` fields

## [1.10.3] - 2022-06-22

### Added

- Add error messages improvement

### Added

- Github Action to trigger manual tests by dispatch

## [1.10.2] - 2022-06-14

### Added

- Added addressID duplicate check, and set hashcode of the address string as the addressID

## [1.10.1] - 2022-06-13

### Fixed

- Fixed on the sales roles impersonation customer users

## [1.10.0] - 2022-06-09

### Added

- Added new features to sales admin, a new UI to handle the users
- Added the UI pagination to users list
- Added a permission to sales manager to handle the users (manager and representative)
- Enabled all the roles on the admin UI interface organization add and edit
- Added a new UI component to handle the organizations without a sales manager

## [1.9.1] - 2022-06-01

### Added

- Added handling to the addUser mutation by showing the correct message when the user already exists

## [1.9.0] - 2022-05-17

### Added

- Added on the Organizations' page the navigation tabs to switch between organizations and organizations requests
- Added on the Organizations details page the navigation tabs to switch between the components being organized

## [1.8.0] - 2022-05-02

### Added

- Include trade policies in price table listing

## [1.7.0] - 2022-04-28

### Added

- Changed the saveUser mutation to addUser and saveUser mutations

### Fixed

- Added a setTimeout and set the loader until the user's table is loaded

## [1.6.1] - 2022-04-25

### Fixed

- Fixed duplicate check to get the status from createOrganizationRequest instead of checking it in RequestOrganizationForm.tsx

## [1.6.0] - 2022-04-18

### Added

- Added a new feature on creating the new address on the cost center which allows the user to set as the default address the new one.

## [1.5.0] - 2022-04-15

### Added

- Added a sessionStorage remove item "b2b-checkout-settings" when a new impersonation or stop impersonation is called

## [1.4.0] - 2022-04-08

### Added

- Add duplicate check for an email that is already associated with a pending or approved request

## [1.3.0] - 2022-04-08

### Added

- UI for new cost center `businessDocument` field

## [1.2.2] - 2022-03-28

### Fixed

- Add `fetchPolicy: 'network-only'` to various queries to ensure fresh data

## [1.2.1] - 2022-03-24

### Added

- docs/images folder and its files to illustrate the documentation

### Changed

- README.md file, reviewing the documentation
- When attempting to impersonate a user, frontend will no longer block impersonation if the `userId` is null. The impersonation mutation from `vtex.b2b-organizations-graphql` will attempt to determine the `userId` from the user's `clId`. If it can't, an error will be returned which will trigger the frontend to display an appropriate message.

## [1.2.0] - 2022-03-22

### Added

Added default shipping address UI option to my account and admin

## [1.1.1] - 2022-03-17

### Added

- Visual indicator for collections / payment terms / price tables that have been assigned to an organization (they now have a checkmark and are greyed out in the "available" list)

## [1.1.0] - 2022-03-08

### Added

- `Impersonate User` action in organization user list
- Impersonation status in `b2b-user-widget`
- `Stop Impersonation` action in `b2b-user-widget`
- User list now shown in Organizations admin panel

### Fixed

- User list is now ordered alphabetically by email
- Remove user mutation now receives correct variable

## [1.0.1] - 2022-03-02

### Fixed

- After adding a cost center in the storefront UI, it will immediately be shown in the cost centers dropdown menu when adding or editing a user

## [1.0.0] - 2022-02-17

### Changed

- Remove billing options

## [0.7.0] - 2022-02-17

### Added

- Added a new button after the organization request form has been submitted which cleans the localStorage property in order to enable submitting another one if the user needs

## [0.6.3] - 2022-01-27

### Fixed

- Better validation for email addresses in forms
- Better validation for required fields in forms
- Ensure forms cannot be submitted multiple times by clicking multiple times
- Ensure cost center addresses can be edited by org admin
- Payment term toggle in admin cost center details page no longer behaves erratically

## [0.6.2] - 2022-01-21

### Added

- Documentation

## [0.6.1] - 2022-01-06

### Added

- SonarCloud quality analysis

## [0.6.0] - 2021-12-22

### Added

- Organization status now shown in `b2b-user-widget`

### Fixed

- "View" row action in admin organizations table

## [0.5.0] - 2021-12-10

### Added

- Organization admin can enable/disable specific payment term options per cost center

### Fixed

- Bug preventing cost center details page in admin from rendering

## [0.4.0] - 2021-12-06

### Added

- Organization request form will now show an appropriate message if the current user has already submitted a request

## [0.3.0] - 2021-12-01

### Added

- My Organization link/page to My Account

### Removed

- `/organization/(:id)` and `/cost-center/:id` routes (these pages are now accessible via My Account)

### Fixed

- Payment Term and Collection IDs are now saved/loaded correctly in organizations admin UI
- Sales users are no longer editable by organization users in storefront organization UI

## [0.2.0] - 2021-11-29

### Added

- `b2b-user-widget` block and component to show logged in user's organization details
- Additional permission checks to storefront UI
- Improved breadcrumb on cost center details page (storefront and admin)

## [0.1.0] - 2021-11-09

### Added

- Storefront UI for B2B customer admins to manage their organization (cost centers and users)

### Fixed

- Store admin can now delete cost center addresses

## [0.0.4] - 2021-10-29

### Fixed

- Update toast usage to match new `@vtex/admin-ui` requirements
- Allow organization names to be changed through `OrganizationDetails` admin component

## [0.0.3] - 2021-10-25

### Added

- Organization Payment Terms

## [0.0.2] - 2021-09-10

### Fixed

- Optimize intl messages

## [0.0.1] - 2021-09-10

### Added

- Initial release
