import { DEFAULT_POKER_VALUES } from "../utils/utils"

/**
 * Pass prop to card that is the value? Iterate through the possible values and show a bunch of cards? 
 * or is that silly to have a component that is literally a div 
 */
export const Card = ({value}: {value: string}) => {
  return (
      <div className="card">
            {value}
      </div>
  )
}

// allow passing custom set of values, but for now
export const AllCards = ({ chooseCard } : { chooseCard: Function}) => {
    return (
      <div className="card-container">
        {DEFAULT_POKER_VALUES.map(pokerValue => (
          <button onClick={() => chooseCard(pokerValue)} className='card-button' key={pokerValue}>
            <Card value={pokerValue}  /> 
          </button>
        ))}
      </div>
    )
}