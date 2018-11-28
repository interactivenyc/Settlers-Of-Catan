import {
  ADD_CARD,
  DELETE_CARD,
  ASSIGN_PLAYER,
  DISTRIBUTE_RESOURCE_PLAYER,
  UPDATE_SCORE_PLAYER,
  SET_RESOURCES,
  MAKE_OFFER,
  RECEIVE_OFFER,
  ACCEPT_OFFER,
  REJECT_OFFER,
  CLEAR_OFFER,
  USE_RESOURCES
} from '../actions'

const playerState = {
  playerHand: [],
  color: null,
  playerNumber: null,
  resources: [
    {type: 'forest', quantity: 100},
    {type: 'field', quantity: 5},
    {type: 'hill', quantity: 100},
    {type: 'mountain', quantity: 6},
    {type: 'pasture', quantity: 5}
  ],
  currentTrade: null,
  score: 0
}

const getResource = (state, type) => {
  let found = state.resources.find(element => {
    return element.type === type
  })
  return found
}

/* eslint-disable complexity */
export default function(state = playerState, action) {
  switch (action.type) {
    case ADD_CARD:
      return {
        ...state,
        playerHand: action.hand
      }
    case DELETE_CARD:
      return {
        ...state,
        playerHand: action.hand
      }
    case ASSIGN_PLAYER:
      return {...state, color: action.color, playerNumber: action.number}
    case DISTRIBUTE_RESOURCE_PLAYER:
      return action.id === state.playerNumber
        ? {
            ...state,
            resources: state.resources.map(
              resource =>
                resource.type === action.resource
                  ? {...resource, quantity: resource.quantity + action.quantity}
                  : resource
            )
          }
        : state
    case UPDATE_SCORE_PLAYER:
      return {
        ...state,
        score: action.updatedScore
      }
    case SET_RESOURCES:
      return {...state, resources: action.resources}
    case MAKE_OFFER:
      return {
        ...state,
        currentTrade: action.currentTrade
      }
    case CLEAR_OFFER:
      return {
        ...state,
        currentTrade: null
      }
    case RECEIVE_OFFER:
      console.log('RECEIVE_OFFER', action.currentTrade)
      return {
        ...state,
        currentTrade: action.currentTrade
      }
    case ACCEPT_OFFER:
      console.log('ACCEPT_OFFER', state.playerNumber, action)
      if (state.currentTrade) {
        if (state.currentTrade.playerNumber === state.playerNumber) {
          console.log('Your offer has been accepted')
          const wantCards = state.currentTrade.wantCards
          for (let i = 0; i < wantCards.length; i++) {
            let resource = getResource(state, wantCards[i].type)
            resource.quantity += wantCards[i].quantity
          }
          const offerCards = state.currentTrade.offerCards
          for (let i = 0; i < offerCards.length; i++) {
            let resource = getResource(state, offerCards[i].type)
            resource.quantity -= offerCards[i].quantity
          }
          return {
            ...state,
            currentTrade: {accepted: true},
            resources: [...state.resources]
          }
        } else if (action.playerNumber === state.playerNumber) {
          console.log('finalize transfer for the person who accepted')
          const wantCards = state.currentTrade.wantCards
          for (let i = 0; i < wantCards.length; i++) {
            let resource = getResource(state, wantCards[i].type)
            resource.quantity -= wantCards[i].quantity
          }
          const offerCards = state.currentTrade.offerCards
          for (let i = 0; i < offerCards.length; i++) {
            let resource = getResource(state, offerCards[i].type)
            resource.quantity += offerCards[i].quantity
          }
        } else {
          console.log('ignore this transaction')
        }
      }
      return {...state, currentTrade: null}
    case REJECT_OFFER:
      console.log('REJECT_OFFER', action)
      if (action.playerNumber === state.playerNumber) {
        // if you're the player who rejected the offer
        return {...state, currentTrade: null}
      } else {
        // if you're the person who made the offer
        return {
          ...state,
          currentTrade: {
            ...state.currentTrade,
            rejected: state.currentTrade.rejected + 1
          }
        }
      }
    case USE_RESOURCES: {
      const newPlayerState = {...state}
      action.resources.forEach(resource => {
        for (const res in newPlayerState.resources) {
          if (newPlayerState.resources[res].type === resource) {
            newPlayerState.resources[res].quantity--
          }
        }
      })
    }
    default:
      return state
  }
}
