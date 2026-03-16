import { Reward } from '../types'
import './SecretMenuTab.css'

const secretMenu: Reward[] = [
  { name: 'Volcano Momos', cost: 100, icon: '🌋' },
  { name: 'Butter Garlic Steam Bomb', cost: 150, icon: '💣' },
  { name: 'Korean Fire Momos', cost: 200, icon: '🔥' }
]

interface SecretMenuTabProps {
  coins: number
}

export default function SecretMenuTab({ coins }: SecretMenuTabProps) {
  return (
    <div>
      <h3>Secret Menu</h3>
      <div className="secret-menu">
        {secretMenu.map((item, index) => {
          const unlocked = coins >= item.cost
          return (
            <div key={index} className={`secret-item ${unlocked ? '' : 'locked'}`}>
              <div>
                <div className="secret-name">{item.icon} {item.name}</div>
              </div>
              <div className="secret-cost">{item.cost} coins</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
