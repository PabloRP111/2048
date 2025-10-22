const gridContainer = document.querySelector('.grid-container');
const GRID_SIZE = 4;
const board = [];
let score = 0;
let endGame = false;
const scoreDisplay = document.getElementById('score');

function isGameOver()
{
	for (let i = 0; i < GRID_SIZE; i++)
	{
		for (let j = 0; j < GRID_SIZE; j++) {
			if (board[i][j].value === 0)
				return false; // aún hay huecos

			// comprobar vecinos
			if (i < GRID_SIZE - 1 && board[i][j].value === board[i + 1][j].value)
				return false;
			if (j < GRID_SIZE - 1 && board[i][j].value === board[i][j + 1].value)
				return false;
		}
	}
	return true;
}

function updateCellStyle(value, cell)
{
	if (value === 0)
	{
		cell.style.backgroundColor = 'papayawhip';
		cell.style.color = '#333';
		cell.textContent = '';
    	return ;
  	}
	const steps = Math.log2(value); //Progresión p2
	const maxSteps = 11; //hata 2048
	const ratio = steps / maxSteps; // 0-1

	// Background empieza claro y se ocureze
	const bgLightness = 92 - ratio * 60;
	const bgColor = `hsl(37, 100%, ${bgLightness}%)`;

	// Texto empieza oscuro y se aclara
	const textLightness = 20 + ratio * 75;
	const textColor = `hsl(0, 0%, ${textLightness}%)`;

	cell.style.backgroundColor = bgColor;
	cell.style.color = textColor;
	cell.textContent = value;
}

function addRandomTile()
{
	const freeSpace = [];

	for (let i = 0; i < GRID_SIZE; i++)
	{
		for (let j = 0; j < GRID_SIZE; j++)
		{
			if (board[i][j].value == 0)
				freeSpace.push({i, j});
		}
	}

	if (freeSpace.length == 0)
	{
		console.warn('No hay espacios libres para generar nueva ficha');
		return ;
	}

	const randomIndex = Math.floor(Math.random() * freeSpace.length);
	const {i, j} = freeSpace[randomIndex];

	const newTileValue = Math.random() < 0.7 ? 2 : 4;
	board[i][j].value = newTileValue;
	board[i][j].cell.textContent = newTileValue;
	board[i][j].mergedThisTurn = false;
	updateCellStyle(newTileValue, board[i][j].cell);

	// Animación
	board[i][j].cell.classList.add('new');
	setTimeout(() => board[i][j].cell.classList.remove('new'), 200);
	
	console.log('placed', newTileValue, 'at', i, j, 'cell element:', board[i][j].cell);
}

function moveBlocks(i, j, x, y)
{
	if ((i >=  GRID_SIZE || i < 0)
		&& (j >=  GRID_SIZE || j < 0)
		&& (x >=  GRID_SIZE || x < 0)
		&& (y >=  GRID_SIZE || y < 0))
		return 1;

	//Fusion
	if (board[x][y].value == board[i][j].value
		&& !board[x][y].mergedThisTurn && !board[i][j].mergedThisTurn)
	{
		board[i][j].value = 0;
		board[x][y].value *= 2;
		board[x][y].mergedThisTurn = true;
		score += board[x][y].value;
		scoreDisplay.textContent = score;

		board[i][j].cell.classList.add('merged');
		setTimeout(() => board[i][j].cell.classList.remove('merged'), 200);

		if (board[x][y].value == 2048 && !endGame)
		{
			endGame = true;
			setTimeout(() => {
				alert('🎉 ¡Ganaste! Has creado el bloque 2048 🎉');
			}, 100);
		}
	}
	else if (board[x][y].value == 0) // Mover
	{
		board[x][y].value = board[i][j].value;
		board[i][j].value = 0;
	}
	updateCellStyle(board[x][y].value, board[x][y].cell);
	updateCellStyle(board[i][j].value, board[i][j].cell);
}

document.addEventListener('keydown', (event) => {
	const key = event.key;
	
	const keys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
	if (keys.includes(event.key))
	{
		if (endGame)
			return ;
		else if (isGameOver())
		{
			endGame = true;
			setTimeout(() => {
				alert('💀 Game Over! Intenta de nuevo.');
			}, 100);
		}

		event.preventDefault(); // evita que la página se desplace

		for (let i = 0; i < GRID_SIZE; i++) //reset fusión
		{
			for (let j = 0; j < GRID_SIZE; j++)
			{
				board[i][j].mergedThisTurn = false;
			}
		}
	}

	if (key === 'ArrowLeft')
	{
		let i = 0;
		let j = 1;
		for (; i < GRID_SIZE; i++)
		{
			for (; j < GRID_SIZE; j++)
			{
				if (board[i][j].value != 0)
				{
					let z = j - 1;
					while (z >= 0)
					{
						if (board[i][z].value != 0 && (board[i][j].value != board[i][z].value))
							break ;
						moveBlocks(i, j, i, z);
						j = z;
						z -= 1; 
					}
				}
			}
			j = 1;
		}
		addRandomTile();
	}
	else if (key === 'ArrowRight')
	{
		let i = 0;
		let j = 2;
		for (; i < GRID_SIZE; i++)
		{
			for (; j >= 0; j--)
			{
				if (board[i][j].value != 0)
				{
					let z = j + 1;
					while (z < GRID_SIZE)
					{
						if (board[i][z].value != 0 && (board[i][j].value != board[i][z].value))
							break ;
						moveBlocks(i, j, i, z);
						j = z;
						z += 1;
					}
				}
			}
			j = 2;
		}
		addRandomTile();
	}
	else if (key === 'ArrowUp')
	{
		let i = 1;
		let j = 0;
		for (; j < GRID_SIZE; j++)
		{
			for (; i < GRID_SIZE; i++)
			{
				if (board[i][j].value != 0)
				{
					let z = i - 1;
					while (z >= 0)
					{
						if (board[z][j].value != 0 && (board[i][j].value != board[z][j].value))
							break ;
						moveBlocks(i, j, z, j);
						i = z;
						z -= 1;
					}
				}
			}
			i = 1;
		}
		addRandomTile();
	}
	else if (key === 'ArrowDown')
	{
		let i = 2;
		let j = 0;
		for (; j < GRID_SIZE; j++)
		{
			for (; i >= 0; i--)
			{
				if (board[i][j].value != 0)
				{
					let z = i + 1;
					while (z < GRID_SIZE)
					{
						if (board[z][j].value != 0 && (board[i][j].value != board[z][j].value))
							break ;
						moveBlocks(i, j, z, j);
						i = z;
						z += 1;
					}
				}
			}
			i = 2;
		}
		addRandomTile();
	}
});

function createMap()
{
	for (let i = 0; i < GRID_SIZE; i++)
	{
		board[i] = [];  // inicializa fila en datos
		for (let j = 0; j < GRID_SIZE; j++)
		{
			const cell = document.createElement('div'); // Crea elemento div
			cell.classList.add('cell'); // Aplica el css de la clase cell

			gridContainer.appendChild(cell); //Inserta el div en el contenedor

			board[i][j] = {
				value: 0,
				cell: cell
			};
		}
	}
}

createMap();
addRandomTile();
addRandomTile();
