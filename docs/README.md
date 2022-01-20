📢 Use this project, [contribute](https://github.com/vtex-apps/b2b-organizations) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# B2B Organizations

<!-- DOCS-IGNORE:start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- DOCS-IGNORE:end -->

The B2B Organizations app provides a method of grouping B2B users into organizations. Payment terms, price tables, and product collections may be assigned to an organization and thereby shared by all of the organization's users. Each organization is further segmented into one or more cost centers, each with its own shipping addresses which are available to that cost center's users in checkout.

Additionally, various roles and levels of permission can be granted to organization users. Users designated as Organization Admins are able to manage their organization and its users through the VTEX storefront.

> ⚠️ _This app uses [Storefront Permissions](https://github.com/vtex-apps/storefront-permissions-ui) to handle roles and permissions for B2B Organization users. See its documentation for information on the available roles and how to customize their permissions._

> ⚠️ _This app may be used in conjunction with [B2B Quotes](https://github.com/vtex-apps/b2b-quotes), allowing quotes to be managed at the organization level._

> ⚠️ _Related modifications to checkout are handled by [B2B Checkout Settings](https://github.com/vtex-apps/b2b-checkout-settings)._

## Configuration

1. [Install](https://vtex.io/docs/recipes/development/installing-an-app/) the `vtex.b2b-organizations` App by running `vtex install vtex.b2b-organizations` in your terminal.
2. (Optional) If you wish to display the current user's organization details in the store header, follow the instructions in the [User Widget](#user-widget-storefront) section below.

## Components

The app adds the following functionalities and components to your VTEX store:

### Organization Request Form (Storefront)

This form allows a B2B user to request the creation of a new organization.

It is available in the storefront at the route `/organization-request` and also in the My Account section by clicking `My Organization`, if the user is not already part of an organization.

After submitting the form, the request will be placed into a queue for review by the store admin. The user designated as the Organization Admin for the new organization will receive an email notification when the request has either been approved or declined.

### Organization Request Queue (Admin)

VTEX admin users may review organization requests by going to **Account Settings > B2B Organizations & Cost Centers > Organization Requests** in the VTEX admin dashboard (or at `/admin/b2b-organizations/requests`). The admin user may click on a request from the table to review it, and then it can either be approved or declined.

Upon approval, the request status will change to `approved` and the organization (including its default cost center) will be created. Additionally, the user designated as the Organization Admin will be granted access to start managing the organization. An email to this effect will be sent to the Organization Admin as well as to all Sales Admins.

If the organization request is declined, the request status will be changed to `declined` and the organization will not be created. The user designated as the Organization Admin is notified via email of this result, and no permissions are granted to them.

> Technical note: Organization requests are stored in Masterdata, within the `organization_requests` data entity.

### Organization Management (Admin)

VTEX admin users may manage any organization by going to **Account Settings > B2B Organizations & Cost Centers > Organizations** in the VTEX admin dashboard (or at `/admin/b2b-organizations/organizations`). A paginated list of all organizations is shown, which can be searched and/or filtered by status. Each organization can have a status of `Active`, `On Hold`, or `Inactive`.

The admin user may manually create new organizations on this page by clicking the `New` button.

The admin user may also click on an existing organization to view or edit its details. The following may be changed:

- The organization's name
- The organization's status
- The cost centers within the organization (see [Cost Center Management](#cost-center-management-admin-storefront))
- The [product collections](https://help.vtex.com/tutorial/creating-collections-beta--yJBHqNMViOAnnnq4fyOye) assigned to the organization (these determine what products the organization users will see in the storefront)
- The [payment terms](https://help.vtex.com/en/tutorial/setting-up-the-promissory-conector--7Gy0SJRVS0Qi2CuWMAqQc0) assigned to the organization (these determine what payment options are available to organization users in checkout -- note that these can be further customized per cost center)
- The [price tables](https://help.vtex.com/en/tutorial/creating-price-tables--58YmY2Iwggyw4WeSCGg24S) assigned to the organization (these determine what prices the organization users will see in the storefront)

⚠️ After making a change, be sure to click `Save` at the top of the page.

⚠️ Note that assignment of collections, payment terms, and price tables is _optional_. If these are not assigned, users of the organization will see the default catalog, have access to all payment methods, and be shown the store's default pricing, respectively.

> Technical note: Organizations are stored in Masterdata, within the `organizations` data entity.

### Organization Management (Storefront)

Users designated as the Organization Admin of an organization may manage its details by logging into the storefront, going to `My Account`, and then clicking on `My Organization` in the sidebar. Users within the organization who have the Buyer or Approver roles may also access a read-only version of this page.

On the `My Organization` page, the Organization Admin may do the following:

- add, edit, or remove cost centers (see [Cost Center Management](#cost-center-management-admin-storefront))
- add, edit, or remove users (see [User Management](#user-management-storefront))

### Cost Center Management (Admin & Storefront)

Both Organization Admin storefront users and VTEX admin users have the ability to add, edit, and remove cost centers. Organization Admins may only take these actions within their own organization, whereas VTEX admin users can manage cost centers for any organization.

Both types of users may make the following changes to a cost center:

- change its name
- add, edit, or remove shipping addresses

⚠️ The shipping addresses assigned to a cost center will be available to that cost center's users at checkout (and no other addresses will be available). Therefore, each cost center must have at least one shipping address.

⚠️ Also note that each organization must have at least one cost center.

In addition to the above actions, VTEX admin users have the ability to enable or disable individual payment terms at the cost center level. By default, each cost center will allow all of the payment terms that have been assigned to the parent organization.

> Technical note: Cost centers are stored in Masterdata, within the `cost_centers` data entity.

### User Management (Storefront)

Organization Admin users may manage the users of their organization via the `My Organization` page within My Account. This includes adding or removing users to or from their organization as well as changing the role or cost center assignment of existing users.

⚠️ Users with the Organization Admin role may add, edit, or remove users with any of the following roles: `Organization Admin`, `Organization Approver`, and `Organization Buyer`.

When adding users, if a VTEX profile does not already exist for the provided email address, it will automatically be created.

If a user is removed from an organization, their VTEX user account will continue to exist, but their assigned organization, cost center, and role will be revoked.

⚠️ VTEX admin users may manage B2B users using the [Customers Admin](https://developers.vtex.com/vtex-developer-docs/docs/vtex-admin-customers) app.

### User Widget (Storefront)

To give storefront users visibility into their currently assigned organization, cost center, and role, this app provides a `b2b-user-widget` block which can be added to the account's store-theme. After installing the app:

1. Modify your store-theme's `manifest.json` file to add this app to its `peerDependencies` like so:

```json
"peerDependencies": {
    "vtex.b2b-organizations": "0.x"
  },
```

2. Modify the JSON within your store-theme's `store` folder to place the block `"b2b-user-widget"` in the desired location (the top row of the store header is recommended). The block accepts no props.
3. Publish and install the modified store-theme.

## Customization

In order to apply CSS customizations in this and other apps, follow the instructions given in the recipe on [Using CSS Handles for store customization](https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-using-css-handles-for-store-customization).

CSS handles are available for the Organization Request Form component and the User Widget component.

| CSS Handles                       |
| --------------------------------- |
| `newOrganizationContainer`        |
| `newOrganizationInput`            |
| `newOrganizationAddressForm`      |
| `newOrganizationButtonsContainer` |
| `newOrganizationButtonSubmit`     |
| `userWidgetContainer`             |
| `userWidgetItem`                  |
| `userWidgetButton`                |

<!-- DOCS-IGNORE:start -->

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

<!-- DOCS-IGNORE:end -->
