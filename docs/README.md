# B2B Organizations

Adds Organization and Cost Center management to the account, it also allow different management level according to the user Role

This App is part of the [B2B Store Edition](https://github.com/vtex/b2b-store-edition), installing it without the related Apps may not result in a good experience
## Functionalities

- Organization Signup
- Organization Management
- Cost Center Management
- User management
- Custom Catalog per Organization
- Pricetables per Organization
- Payment Terms per Organization and Cost Center
- Multiple addresses per Cost Center


## Configuration

[Install](https://vtex.io/docs/recipes/development/installing-an-app/) the `vtex.b2b-organizations` App by running `vtex install vtex.b2b-organizations` in your terminal.

After installation, you'll have a new route available to your store `/organization-request`. This route will allow Organizations to signup to your Store

Once an Organization signup, you can approve their request from the Admin under the menu **Account Settings > B2B Organizations & Cost Centers > Organization Requests** (`/admin/b2b-organizations/requests`)

To manage an Organization, head over **Account Settings > B2B Organizations & Cost Centers > Organizations**.

It's possible to associate Price Tables, Collections and Payment Terms to an Organization, those are existing information within the Store Account

- [Collections](https://help.vtex.com/tutorial/creating-collections-beta--yJBHqNMViOAnnnq4fyOye) 
- [Price Tables](https://help.vtex.com/en/tutorial/creating-price-tables--58YmY2Iwggyw4WeSCGg24S) 
- [Payment Terms](https://help.vtex.com/en/tutorial/setting-up-the-promissory-conector--7Gy0SJRVS0Qi2CuWMAqQc0) (Promissory)

As an Organization, you can manage your Cost Center and Users under **My Account >  My Organization**
