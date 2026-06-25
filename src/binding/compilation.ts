import { PredefinedTypeNames } from "../predefined-type-names.js";
import type { CompilationUnitSyntax } from "../syntax/compilation-unit-syntax.js";
import { BindingContext, ModuleBinder } from "./binder.js";
import type { BoundDeclaration } from "./bound-node.js";
import { ModuleSymbol, StructTypeSymbol } from "./symbol.js";

export class Compilation {
    #declarations: BoundDeclaration[] | undefined;

    constructor(
        readonly syntaxTrees: readonly CompilationUnitSyntax[],
        readonly globalModule: ModuleSymbol = Compilation.createGlobalModule(),
        readonly context: BindingContext = new BindingContext()) { }

    get diagnostics() {
        return this.context.diagnostics;
    }

    bindAll(): readonly BoundDeclaration[] {
        if (this.#declarations) return this.#declarations;

        const binder = new ModuleBinder(this.globalModule, undefined, this.context);
        const declarations = new Array<BoundDeclaration>();
        for (const syntaxTree of this.syntaxTrees) {
            for (const declarationSyntax of syntaxTree.declarations) {
                declarations.push(binder.bindDeclaration(declarationSyntax));
            }
        }

        return this.#declarations = declarations;
    }

    static createGlobalModule(): ModuleSymbol {
        const global = new ModuleSymbol("<global>", undefined as unknown as ModuleSymbol, undefined);
        (global as { containingModule: ModuleSymbol }).containingModule = global;

        for (const name of Object.values(PredefinedTypeNames)) {
            global.add(new StructTypeSymbol(name, global, undefined));
        }

        return global;
    }
}
