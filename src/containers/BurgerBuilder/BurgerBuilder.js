import React, {Component} from 'react';
import Auxiliary from '../../hoc/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import WithErrorHandler from '../../hoc/WithErrorHandler/WithErrorHandler';

const INGREDIENTS_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}
 
class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = { ... }
    // }

    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        axios.get('https://react-burgerbuilder-79d79.firebaseio.com/ingredients.json')
        .then(response => {
            this.setState({
                ingredients: response.data
            })
        })
        .catch(error => {
            this.setState({
                error: true
            })
        })
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENTS_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({
                totalPrice: newPrice,
                ingredients: updatedIngredients
        });

        this.updatePurchasState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];

        if(oldCount <= 0) {
            return;
        }

        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENTS_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceAddition;
        this.setState({
                totalPrice: newPrice,
                ingredients: updatedIngredients
        });
        this.updatePurchasState(updatedIngredients);
    }

    updatePurchasState (ingredients) {
        const sum = Object.keys(ingredients)
        .map(igkey => {
            return ingredients[igkey];
        }).reduce((sum, el) => {
            return sum + el;
        }, 0);

        this.setState({
            purchasable: sum > 0
        })
    }

    purchaseHandler = () => {
        this.setState({
            purchasing: true
        })
    }

    purchaseCancelHandler = () => {
        this.setState({
            purchasing: false
        })
    }

    purchaseContinueHandler = () => {
       //alert('You Continue');
    //    this.setState({
    //        loading: true
    //    });
    //    const order = {
    //        ingredients: this.state.ingredients,
    //        price: this.state.totalPrice,
    //        customer: {
    //            name: 'Prakash Chandra Awal',
    //            address: {
    //                street: 'Sallaghari, BKT',
    //                zipCode: '54365',
    //                country: 'Nepal'
    //            },
    //            email: 'chandiprakash16@gmail.com',
    //        },
    //        deliveryMethod: 'fastest'

    //    }
    //     axios.post('/orders.json', order )
    //     .then(response => {
    //         this.setState({
    //             loading: false,
    //             purchasing: false
    //         })
    //     })
    //     .catch(error => {
    //         this.setState({
    //             loading: false,
    //             purchasing: false
    //         })
    //     });

        const queryParams = [];
        for (let i in this.state.ingredients) {
            queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
        }
        const queryString = queryParams.join('$');

        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        });
     }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        }
        
        for(let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }
        let orderSummary = null;

      
        let burger = this.state.error ? <p>Ingredients cant be load!!</p> : <Spinner />;

        if(this.state.ingredients) {
            burger =  (
                <Auxiliary>
                <Burger ingredients={this.state.ingredients} />
                <BuildControls
                ingredientAdded={this.addIngredientHandler}
                ingredientRemove={this.removeIngredientHandler}
                disabled={disabledInfo}
                price={this.state.totalPrice}
                purchasable={this.state.purchasable}
                ordered={this.purchaseHandler} />
                </Auxiliary> 
                );

                orderSummary = <OrderSummary ingredients={this.state.ingredients}
                price={this.state.totalPrice.toFixed(2)}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
               />
        }

        
        if(this.state.loading) {
            orderSummary = <Spinner />;
        }

        
       

        return (
            <Auxiliary>
            <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
               {orderSummary}
            </Modal>
             {burger}
            </Auxiliary>
        );
    }

}

export default WithErrorHandler(BurgerBuilder, axios);