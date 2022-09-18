const itemName = 'imagenes';

const read = () => {
    //recuperar datos del storage
    const store = localStorage.getItem(itemName);
    return store ? JSON.parse(store) : []

}

const write = content => {
    //escribir en el localStorage
    localStorage.setItem(itemName, JSON.stringify(content));
}
    //borrar item 
const destroy = id => {
    const tmp = [...read()]; // array de lecturas
    const index = tmp.findIndex(item => item.id === id); // busqueda por indice
    tmp.splice(index, 1) // eliminado
    write(tmp); //reescritura
}


export {
    read,
    write,
    destroy
}