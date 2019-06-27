import React from 'react';

export default function (props) {
    return (
        <div>
            <h3>Welcome.</h3>
            {/* https://gogobackend.azurewebsites.net */}
            {/* localhost:56533 */}
            <p>Choose board type:</p>
            <button onClick={() => window.location.href='/game/standard'}>Standard</button>
            <button onClick={() => window.location.href='/game/3d'}>3D</button>
        </div>
    )
}
