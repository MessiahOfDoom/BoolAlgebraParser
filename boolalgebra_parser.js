
class Token {
    constructor(text, index) {
        this.text = text;
        this.index = index;

        if (/^_[A-Za-z_]/.test(text)) {
            this.kind = 'func';
        }
        else if(/^[Ss]\d+/.test(text)) {
            this.kind = 'switch';
            this.text = this.text.toUpperCase();
        }
        else {
            this.kind = 'operator';
        }
    }
}

class Expression {
    constructor(optoken, arglist) {
        this.optoken = optoken
        this.arglist = arglist
    }
    toTruthTable(switchstates){
        throw{
            name: "How did we get here",
            message: "It should not be possible for you to read this"
        }
    }
    toString(){
        return "Expression: { token: " + optoken + ", arglist: " + argList + "}";
    }


    generateTruthTableComlumn(column){
        for(var arg in this.arglist){
            this.arglist[arg].generateTruthTableComlumn(column);
        }
        return column;
    }
}

class Expression_And extends Expression{
    constructor(optoken, left, right) {
        super(optoken, [left, right]);
        this.left = left;
        this.right = right;
    }
    toTruthTable(switchstates){
        return this.left.toTruthTable(switchstates) && this.right.toTruthTable(switchstates)
    }
}

class Expression_Or extends Expression{
    constructor(optoken, left, right) {
        super(optoken, [left, right]);
        this.left = left;
        this.right = right;
    }
    toTruthTable(switchstates){
        return this.left.toTruthTable(switchstates) || this.right.toTruthTable(switchstates)
    }
}

class Expression_XOr extends Expression{
    constructor(optoken, left, right) {
        super(optoken, [left, right]);
        this.left = left;
        this.right = right;
    }
    toTruthTable(switchstates){
        return (this.left.toTruthTable(switchstates) ^ this.right.toTruthTable(switchstates)) == 1
    }
}

class Expression_Not extends Expression{
    constructor(optoken, right) {
        super(optoken, [right]);
        this.right = right;
    }
    toTruthTable(switchstates){
        return !this.right.toTruthTable(switchstates)
    }
}

class Expression_Switch extends Expression{
    constructor(optoken) {
        super(optoken, [])
    }
    toTruthTable(switchstates){
        return switchstates[this.optoken.text];
    }
    generateTruthTableComlumn(column){
        column[this.optoken.text] = false;
        return column;
    }

}

class Expression_Function extends Expression{
    constructor(optoken, arglist){
        super(optoken, arglist);
    }
    toTruthTable(switchstates){
        //TODO proper function implementation
        return this.arglist[0].toTruthTable(null);
    }
}

class Parser {
    constructor(text) {
        this.nextTokenIndex = 0;
        this.tokenList = [];
        const tokenChecker = /[Ss]\d+|\S/g;// /[Ss]\d+|_[A-Za-z][A-Za-z_0-9]*|\S/g
        let match = "Nothing to see here, move along";
        while(match !== null){
            match = tokenChecker.exec(text);
            if(match !== null)this.tokenList.push(new Token(match[0], match.index));
        }
    }


    /*
    expr ::= value { operator value}
    value ::= switch | "(" expr ")" | "!" value | function
    function ::= func "(" value { "," value } ")"
    switch ::= /[Ss]\d+/
    func ::= /_[A-Za-z][A-Za-z_0-9]* /
    */

    parse() {
        return this.parseExpr();
    }

    parseExpr() {
        var expr = this.parseValue();
        var token;
        while(token = this.isNextTokenAny(["&", "|", "^"])){
            const other = this.parseValue();
            switch(token.text){
                case "&":
                    expr = new Expression_And(token, expr, other);
                    break;
                case "|":
                    expr = new Expression_Or(token, expr, other);
                    break;
                case "^":
                    expr = new Expression_XOr(token, expr, other);
                    break;
            }
        }
        return expr;
    }

    parseValue() {
        const token = this.getNextToken();
        if(token.kind == 'switch'){
            return new Expression_Switch(token)
        }
        else if(token.text == '('){
            const expr = this.parseExpr();
            if(this.getNextToken().text == ')'){
                return expr;
            }else{
                throw{
                    name: 'ILLEGOAL',
                    message: 'Expected closing brackets',
                    token: token
                }
            }

        }
        else if(token.text == '!'){
            const expr = this.parseValue();
            return new Expression_Not(token, expr);
        }
        else if(token.kind == 'func'){
            return this.parseFunc(token);
        }
        throw{
            name: 'Wrong Argument',
            message: 'Got a non-valid Input',
            token: token
        }
    }

    parseFunc(token) {

        let token2
        if(token2 = this.isNextTokenAny(["("])){
            let argList = []
            argList.push(this.parseExpr());
            while((token2 = this.getNextToken()) && token2.text == ','){
                argList.push(this.parseExpr());
            }
            if(token2.text == ')'){
                return new Expression_Function(token, argList);
            }else{
                throw{
                    name: 'Unterminated Function Expression',
                    message: 'Expected closing brackets but got: ' + token2.text,
                    token: token
                }
            }
        }else{
            throw{
                name: 'Wrong Argument',
                message: 'Expected opening brackets after function declaration: ' + token.text + 'but got: ' + token2.text,
                token: token
            }
        }
    }

    getNextToken(simulate = false){
        if(this.nextTokenIndex < this.tokenList.length){
            const token = this.tokenList[this.nextTokenIndex];
            if(!simulate)this.nextTokenIndex++;
            return token;
        }
        return null;
    }

    isNextTokenAny(possibilities){
        let token = this.getNextToken(true)
        return token && possibilities.indexOf(token.text) >= 0 ? this.getNextToken() : null;
    }
}
