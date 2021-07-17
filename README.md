# Max Eats

The backend of Max Eats Clone

## User Entity
- [X] id
- [X] createdAt
- [X] updatedAt
- [X] email
- [X] password
- [X] role(client|owner|delivery)

## User CRUD:
- [X] Create Account
- [X] Log In
- [X] See Profile
- [X] Edit Profile
- [X] Verify Email

## Resturant Model
- [x] Name
- [x] Category
- [x] Address
- [x] Cover Image

## Restaurant CRUD
- [x] Edit Restaurant
- [x] Delete Restaurant

- [x] See categories
- [x] See Restaurants by Category (pagination)
- [x] See Restaurants (pagination)
- [x] See Restaurant  
- [x] Search Restaurant

- [x] Create Dish
- [x] Edit Dish
- [x] Delete Dish

## Orders CRUD
- [x] Create Order
- [x] Read Order
- [X] Edit Order status
   
## Orders Subscription
- [x] Pending Orders (Subscription: newOrder) (trigger: createOrder(newOrder))
- [ ] Order Status (Client, Delivery, Owner) (Sub: orderUpdate) (Trigger: editOrder(orderUpdate))
- [x] Pending Pickup Order (Delivery) (Sub: orderUpdate) (Trigger: editOrder(orderUpdate))


## Payment (CRON)