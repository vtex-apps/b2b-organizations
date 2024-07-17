# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Adjust search list many organations at change organization modal

## [1.31.11] - 2024-07-05

## [1.31.10] - 2024-07-03

### Feat

- Implement 'none' option at trade policy organization

## [1.31.9] - 2024-06-20
### Fixed

- Adjusts list organization and research screening according to input at autocomplete

## [1.31.8] - 2024-06-05

## [1.31.7] - 2024-05-29

## [1.31.6] - 2024-05-28

## [1.31.5] - 2024-05-28
### Fixed

- Save new address within the Cost Center in the store

## [1.31.4] - 2024-05-23

### Fixed

Arabic, Bulgarian, Catalan, Czech, Danish, German, Greek, English, Spanish, Finnish, French, Indonesian, Italian, Japanese, Korean, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Swedish, Thai and Ukrainian translations.

## [1.31.3] - 2024-04-22

### Fixed

- Save add, edit and delete address within the Cost Center in admin

### Fixed

- Pagination bug on admin organization details collections assignment UI

### Added

- Loading indicators for admin organization details: cost centers, collections, payment terms, price tables, and sellers

## [1.31.2] - 2024-03-14

### Changed

- Update bulk import ui

## [1.31.1] - 2024-03-07

### Fixes

- Apply fixes on bulk import feature

## [1.31.0] - 2024-02-27

### Added

- Add help footer on bulk import upload modal

## [1.30.2] - 2024-01-31

### Added

Adds a Tooltip when the user don't have permission to access the bulk import feature.

## [1.30.1] - 2024-01-26

### Fixed

Arabic, Bulgarian, Catalan, Czech, Danish, German, Greek, English, Spanish, Finnish, French, Indonesian, Italian, Japanese, Korean, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Swedish, Thai, and Ukrainian translations.

## [1.30.0] - 2024-01-26

### Added

- Refactor Bulk import Uploading Modal to Async Validation

## [1.29.2] - 2024-01-12

### Fixed

- Fix unauthorized requests breaking on bulk import

## [1.29.1] - 2024-01-04

### Fixed

- Fix error message in bulk import

## [1.29.0] - 2024-01-03

### Added

- Add Bulk import feature

## [1.28.2] - 2023-12-19

### Fixed

- Fixing on seller wrapper when there is no seller available

## [1.28.1] - 2023-11-06

### Fixed

- Arabic, Bulgarian, Catalan, Czech, Danish, German, Greek, English, Spanish, Finnish, French, Indonesian, Italian, Japanese, Korean, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian, Slovakian, Slovenian, Swedish, Thai and Ukrainian translations.

## [1.28.0] - 2023-10-18

### Added

- Finished the sellers implementation by adding the SellerWrapper block into interfaces in order to complete the sellers' experience

## [1.27.3] - 2023-10-10

### Fixed

- Improve quality gate on Sonar

## [1.27.2] - 2023-10-06

### Fixed

- Fix to impersonate user with the role `sales`

## [1.27.1] - 2023-08-17

### Fix

- `EditUserModal` was not opening in the admin

## [1.27.0] - 2023-08-14

### Added

- Added metrics to Impersonate events
- Added metrics to Stop Impersonating events
- Added metrics to change team events

## [1.26.2] - 2023-08-11

### Added

- Add condition to use the `manage-organization` permission

## [1.26.1] - 2023-08-11

### Changed

- Update styles of the organizations list table

## [1.25.0] - 2023-07-24

### Added

- Added the custom fields to the organization request admin page view

## [1.24.8] - 2023-07-17

### Changed

- Move the organization creation button to the topbar

## [1.24.7] - 2023-07-13

### Changed

- Update layout and tabs to the new admin style

## [1.24.6] - 2023-07-11

### Changed

- Bump @vtex/admin-ui to v0.136.1

## [1.24.5] - 2023-05-29

### Fixed

- Fixed button label when adding/removing collections/sellers/etc to/from org

## [1.24.4] - 2023-05-12

### Fixed

- Fixed missing back button in shopper my organizations page

## [1.24.3] - 2023-05-11

### Added

- `showLoadingIndicator` prop on user widget which controls whether a loading indicator will be displayed while widget data is loading

## [1.24.2] - 2023-04-21

### Fixed

- Fixed impersonation user

## [1.24.1] - 2023-04-13

### Fixed

- Fixed pagination with organization ID

## [1.24.0] - 2023-04-11

### Fixed

- Fixed number of organizations

### Added

- UX improvements

### Removed

- [ENGINEERS-1247] - Disable cypress tests in PR level

## [1.23.0] - 2023-04-05

### Added

- Added added condition in order to show business and state field disabled

## [1.22.7] - 2023-03-28

### Added

- Added CssHandle class to cost center details

## [1.22.6] - 2023-03-28

### Fixed

- German translation.

## [1.22.5] - 2023-03-27

### Added

- Added CssHandle class to parent container of my account cost center creation

### Changed

- Run schedule job only on saturday

## [1.22.4] - 2023-03-21

### Added

- Added impersonation in order to add storefront permissions

## [1.22.3] - 2023-03-20

### Fixed

- Bug fixed on the user widget when the user role was shown wrongly

## [1.22.2] - 2023-03-17

### Added

- Added Auto Refresh when the user is authenticated and `Auto Approve` is enabled

## [1.22.1] - 2023-03-01

### Fixed

- Bug fixed on search users by organization

## [1.22.0] - 2023-03-01

### Added

Custom Fields:

- Added custom fields to save more information when creating a new cost center or organization
- Custom fields not required fields on registration and could be show/hidden for the customer
- Updated admin-ui package to the latest version, which is required to make the table work
- Fixed breaking changes with Toast component
- Updated some of the wording in multiple languages

## [1.21.1] - 2023-02-17

### Fixed

- When the user logs in or switches the organization, the data into `__RUNTIME__` is updated

## [1.21.0] - 2023-02-13

### Added

- Added the UI to handle the Payment terms and Price tables

## [1.20.0] - 2023-02-09

### Added

- Modal to switch the company rather than AutoComplete component
- Handle the sellers on the Organization Details
- Handle the UI settings (modal, clear cart and auto approve)

## [1.19.2] - 2023-02-07

### Fixed

- Removing the ref interface

## [1.19.1] - 2023-02-07

### Fixed

- Bug fixed on ref interface file

## [1.19.0] - 2023-01-27

### Added

- Indonesian translation.

### Fixed

- Arabic, Bulgarian, Catalan, Czech, Danish, German, Greek, English, Spanish, Finnish, French, Italian, Korean, Dutch, Norwegian, Polish, Portuguese, Romanian, Russian, Slovakian, Slovenian, Swedish, Thai and Ukrainian translations.

## [1.18.0] - 2023-01-09

### Added

- it was removed the duplicated validation due to the one to many feature

## [1.17.1] - 2022-12-20

### Changed

- Cypress improvements

### Fixed

- Bug fixed on interfaces reference

## [1.17.0] - 2022-12-08

### Added

- Added the possibility to control whether to show the dropdowns in the UserWidget component when we have more than one organization associated with the email

## [1.16.3] - 2022-11-09

### Fixed

- Some yarn package vulnerabilities reported by Dependabot

=======

## [1.16.2] - 2022-11-07

### Fixed

- Fixed on the sales channel values

## [1.16.1] - 2022-10-28

### Fixed

- Fixed on user widget label (cost center) and limit the number of organizations by 15

## [1.16.0] - 2022-10-26

### Added

- Added the state registration field to the cost center UI

## [1.15.0] - 2022-10-21

### Changed

- Split bindings testcase into two files

### Added

- Feature related to one to many feature, it's possible to change the current organization by using the user widget on the top of storefront

### Changed

- it was grouped the graphql Queries in order to improve the performance on the storefront user widget

## [1.14.3] - 2022-10-21

### Changed

- Improve the organization binding setting UI

## [1.14.2] - 2022-10-20

### Fixed

- bugfix on mkt tags UI

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
