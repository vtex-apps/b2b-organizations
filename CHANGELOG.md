# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Documentation

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
