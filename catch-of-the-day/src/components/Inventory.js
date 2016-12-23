import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {

	constructor() {
		super();

		this.renderInventory = this.renderInventory.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.authenticate = this.authenticate.bind(this);
		this.renderLogin = this.renderLogin.bind(this);
		this.authenticate = this.authenticate.bind(this);
		this.authHandler = this.authHandler.bind(this);
		this.logout = this.logout.bind(this);
		this.state = {
			uid: null,
			owner: null
		}
	}

	componentDidMount() {
		base.onAuth((user) => {
			if (user) {
				this.authHandler(null, { user });
			}
		})
	}

	handleChange(event, key) {
		const fish = this.props.fishes[key];
		const updatedFish = {...fish,
			[event.target.name]: event.target.value
		};

		this.props.updateFish(key, updatedFish);
	}

	authenticate(provider) {
		base.authWithOAuthPopup(provider, this.authHandler);
	}

	logout() {
		base.unauth();

		this.setState({
			user: null
		})
	}

	authHandler(err, authData) {
		if (err) {
			console.error(err);
			return;
		}

		const storeRef = base.database().ref(this.props.storeId);

		storeRef.once('value', (snapshot) => {
			const data = snapshot.val() || {};

			if (!data.owner) {
				storeRef.set({
					owner: authData.user.uid
				})
			}

			this.setState({
				uid: authData.user.uid,
				owner: data.owner || authData.user.uid
			})
		})
	}

	renderLogin() {
		return (
			<div>
				<h2>Inventory</h2>
				<p>Sign in to manage you store's inventory</p>
				<button className="google" onClick={() => this.authenticate('google')}>Login with Google</button>
				<button className="github" onClick={() => this.authenticate('github')}>Login with Github</button>
			</div>
		)
	}

	renderInventory(key) {
		const fish = this.props.fishes[key];

		return (
			<div className="fish-edit" key={key}>
				<input type="text" name="name" value={fish.name} placeholder="Fish Name" onChange={(event) => this.handleChange(event, key)} />
				<input type="text" name="price" value={fish.price} placeholder="Fish Price" onChange={(event) => this.handleChange(event, key)} />
				<select name="status" value={fish.status} placeholder="Fish Status" onChange={(event) => this.handleChange(event, key)}>
					<option value="available">Fresh!</option>
					<option value="unavailable">Sold Out!</option>
				</select>
				<textarea name="desc" value={fish.desc} placeholder="Fish Desc" onChange={(event) => this.handleChange(event, key)}></textarea>
				<input type="text" name="image" value={fish.image} placeholder="Fish Image" onChange={(event) => this.handleChange(event, key)} />

				<button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
			</div>
		);
	}

	render() {
		const logout = <button onClick={this.logout}>Log out</button>;

		// Not logged in
		if (!this.state.uid) {
			return this.renderLogin();
		}

		// Is not the current owneer
		if (this.state.uid !== this.state.owner) {
			return (
				<div>
					<h2>Inventory</h2>
					<p>Sorry, you are not the owner of this store</p>
					{logout}
				</div>
			)
		}

		return (
			<div>
				<h2>Inventory</h2>
				{logout}
				{Object.keys(this.props.fishes).map(this.renderInventory)}
				<AddFishForm addFish={this.props.addFish} />
				<button onClick={this.props.loadSamples}>Load sample fishes</button>
			</div>
		)
	}
}

Inventory.propTypes = {
	storeId: React.PropTypes.string.isRequired,
	fishes: React.PropTypes.object.isRequired,
	addFish: React.PropTypes.func.isRequired,
	updateFish: React.PropTypes.func.isRequired,
	removeFish: React.PropTypes.func.isRequired,
	loadSamples: React.PropTypes.func.isRequired,
}

export default Inventory;
